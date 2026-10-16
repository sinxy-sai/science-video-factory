import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {ShotBrief, ShotRenderer} from '../content/shot-brief';
import {projectToolEnv} from '../scripts/episode-utils';

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

const hyperframes: RendererAdapter = {
  id: 'hyperframes-default',
  validate: (context) => {
    const errors = checkDeclaredFiles(context);
    if (!existsSync(join(context.directory, 'index.html'))) errors.push(`missing ${context.directory}/index.html`);
    return errors;
  },
  run: (operation, context) => {
    const strict = context.brief.qualityChecks.strict ? ['--strict'] : [];
    const args = operation === 'validate'
      ? ['check', context.directory, ...strict]
      : operation === 'render'
        ? ['render', context.directory, '--output', context.output ?? '', '--quality', 'delivery', ...strict]
        : ['preview', context.directory, '--background', '--no-open'];
    return spawnSync(cliPath(), args, {stdio: 'inherit', shell: true, env: projectToolEnv(), cwd: context.directory}).status ?? 1;
  },
};

const remotion: RendererAdapter = {
  id: 'remotion-native',
  validate: (context) => {
    const errors = checkDeclaredFiles(context);
    if (!context.brief.implementation.remotion) errors.push('remotion-native requires implementation.remotion=true');
    return errors;
  },
  run: (operation) => operation === 'validate' ? 0 : 1,
};

const external = (id: Exclude<ShotRenderer, 'hyperframes-default' | 'remotion-native'>): RendererAdapter => ({
  id,
  validate: (context) => {
    const errors = checkDeclaredFiles(context);
    if (errors.length === 0) errors.push(`${id} adapter requires a declared source and rendered output contract; no executable project adapter is configured yet`);
    return errors;
  },
  run: () => 1,
});

const adapters: Record<ShotRenderer, RendererAdapter> = {
  'hyperframes-default': hyperframes,
  'remotion-native': remotion,
  manim: external('manim'),
  canvas: external('canvas'),
  'motion-canvas': external('motion-canvas'),
};

export function getRendererAdapter(renderer: ShotRenderer): RendererAdapter {
  const adapter = adapters[renderer];
  if (!adapter) throw new Error(`No renderer adapter registered for ${renderer}`);
  return adapter;
}

export function validateRenderer(context: RendererContext): void {
  const errors = getRendererAdapter(context.brief.renderer).validate(context);
  if (errors.length > 0) throw new Error(`${context.episodeId}/${context.brief.id} (${context.brief.renderer}): ${errors.join('; ')}`);
}

