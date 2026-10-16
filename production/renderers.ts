import {existsSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {ShotBrief, ShotRenderer} from '../content/shot-brief';
import {projectToolEnv} from '../scripts/lib/episode-runtime';

export type RendererOperation = 'validate' | 'render' | 'preview';

export type RendererContext = {
  episodeId: string;
  brief: ShotBrief;
  directory: string;
  output?: string;
};

export type RendererAdapter = {
  id: ShotRenderer;
  validate: (context: RendererContext) => string[];
  run: (operation: RendererOperation, context: RendererContext) => number;
};

const cliPath = () => resolve('node_modules', '.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
const requiredSourceFiles = (context: RendererContext) => context.brief.implementation.files.map((file) => join(resolve('content', 'episodes', context.episodeId), file));
const checkDeclaredFiles = (context: RendererContext): string[] => requiredSourceFiles(context).filter((file) => !existsSync(file)).map((file) => `missing declared implementation file: ${file}`);

function validateBrowserSource(context: RendererContext): string[] {
  const errors = checkDeclaredFiles(context);
  const indexPath = join(context.directory, 'index.html');
  if (!existsSync(indexPath)) {
    errors.push(`missing ${indexPath}`);
    return errors;
  }
  const source = readFileSync(indexPath, 'utf8');
  if (!source.includes('data-composition-id=')) errors.push('browser shot must declare data-composition-id');
  if (!source.includes('data-width=') || !source.includes('data-height=') || !source.includes('data-duration=')) errors.push('browser shot must declare data-width, data-height, and data-duration');
  if (context.brief.implementation.visualMode === 'webgl') {
    if (!source.includes("addEventListener('hf-seek'") && !source.includes('addEventListener("hf-seek"')) errors.push('webgl shot must render from the HyperFrames hf-seek event');
  } else if (!source.includes('window.__timelines')) {
    errors.push('browser shot must register window.__timelines');
  }
  if (context.brief.implementation.sourceRoot.startsWith('hyperframes/')) errors.push('legacy hyperframes source path is not supported; use html/<shot-id>/');
  return errors;
}

const browser: RendererAdapter = {
  id: 'browser',
  validate: validateBrowserSource,
  run: (operation, context) => {
    const strict = context.brief.qualityChecks.strict ? ['--strict'] : [];
    const output = context.output ?? resolve(context.brief.implementation.output.path);
    const args = operation === 'validate'
      ? ['check', context.directory, ...strict]
      : operation === 'render'
        ? ['render', context.directory, '--output', output, '--quality', 'delivery', ...strict]
        : ['preview', context.directory, '--background', '--no-open'];
    return spawnSync(cliPath(), args, {stdio: 'inherit', shell: true, env: projectToolEnv(), cwd: context.directory}).status ?? 1;
  },
};

const external = (id: Exclude<ShotRenderer, 'browser'>): RendererAdapter => ({
  id,
  validate: (context) => {
    const errors = checkDeclaredFiles(context);
    if (errors.length === 0) errors.push(`${id} adapter is not configured; provide an executable ${id} renderer before selecting it`);
    return errors;
  },
  run: () => 1,
});

const adapters: Record<ShotRenderer, RendererAdapter> = {browser, manim: external('manim'), blender: external('blender')};

export function getRendererAdapter(renderer: ShotRenderer): RendererAdapter {
  const adapter = adapters[renderer];
  if (!adapter) throw new Error(`No renderer adapter registered for ${renderer}`);
  return adapter;
}

export function validateRenderer(context: RendererContext): void {
  const errors = getRendererAdapter(context.brief.renderer).validate(context);
  if (errors.length > 0) throw new Error(`${context.episodeId}/${context.brief.id} (${context.brief.renderer}): ${errors.join('; ')}`);
}
