import {existsSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {ShotBrief, ShotRenderer} from '../content/shot-brief';
import {projectToolEnv} from '../scripts/lib/episode-runtime';
import {resolveDependencyPaths} from '../scripts/lib/project-dependencies';

export type RendererOperation = 'validate' | 'render' | 'preview';

export type RendererContext = {
  episodeId: string;
  brief: ShotBrief;
  directory: string;
  output?: string;
  projectRoot?: string;
};

export type RendererAdapter = {
  id: ShotRenderer;
  validate: (context: RendererContext) => string[];
  run: (operation: RendererOperation, context: RendererContext) => number;
};

const cliPath = () => resolve('node_modules', '.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
const requiredSourceFiles = (context: RendererContext) => context.brief.implementation.files.map((file) => join(resolve(context.projectRoot ?? '.', 'content', 'episodes', context.episodeId), file));
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

function validateManimSource(context: RendererContext): string[] {
  const errors = checkDeclaredFiles(context);
  if (!context.brief.implementation.sourceRoot.startsWith('manim/')) errors.push('manim shots must use a manim/<shot-id>/ sourceRoot');
  if (!context.brief.implementation.entryPoint) errors.push('manim source must declare implementation.entryPoint');
  const pythonFiles = requiredSourceFiles(context).filter((file) => file.endsWith('.py') && existsSync(file));
  if (pythonFiles.length === 0) errors.push('manim source must declare a .py implementation file');
  if (context.brief.implementation.entryPoint && pythonFiles.length > 0) {
    const source = pythonFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
    const pattern = new RegExp(`class\\s+${context.brief.implementation.entryPoint}\\s*\\(`);
    if (!pattern.test(source)) errors.push(`manim source does not define entryPoint ${context.brief.implementation.entryPoint}`);
  }
  const dependencies = resolveDependencyPaths(context.projectRoot);
  if (!dependencies.python) errors.push('missing project Python at .venv');
  if (!dependencies.manim) errors.push('missing Manim executable in .venv');
  if (!dependencies.ffmpeg) errors.push('missing FFmpeg in tools/ffmpeg/bin');
  return errors;
}

const manim: RendererAdapter = {
  id: 'manim',
  validate: validateManimSource,
  run: (operation, context) => {
    const dependencies = resolveDependencyPaths(context.projectRoot);
    if (!dependencies.python) return 1;
    const sourceFiles = requiredSourceFiles(context).filter((file) => file.endsWith('.py'));
    const sceneFile = sourceFiles[0];
    if (!sceneFile || !context.brief.implementation.entryPoint) return 1;
    const output = context.output ?? resolve(context.brief.implementation.output.path);
    const projectRoot = resolve(context.projectRoot ?? '.');
    const args = operation === 'validate'
      ? ['-m', 'manim', 'render', sceneFile, context.brief.implementation.entryPoint, '--dry_run', '--disable_caching']
      : operation === 'render'
        ? ['-m', 'manim', 'render', sceneFile, context.brief.implementation.entryPoint, '--disable_caching', '--media_dir', resolve(projectRoot, 'renders', context.episodeId, 'manim-media'), '--output_file', output, '--resolution', `${context.brief.implementation.output.width},${context.brief.implementation.output.height}`, '--fps', String(context.brief.implementation.output.fps)]
        : ['-m', 'manim', 'render', sceneFile, context.brief.implementation.entryPoint, '--preview', '--disable_caching'];
    return spawnSync(dependencies.python, args, {stdio: 'inherit', shell: true, env: projectToolEnv(context.projectRoot), cwd: context.directory}).status ?? 1;
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

const adapters: Record<ShotRenderer, RendererAdapter> = {browser, manim, blender: external('blender')};

export function getRendererAdapter(renderer: ShotRenderer): RendererAdapter {
  const adapter = adapters[renderer];
  if (!adapter) throw new Error(`No renderer adapter registered for ${renderer}`);
  return adapter;
}

export function validateRenderer(context: RendererContext): void {
  const errors = getRendererAdapter(context.brief.renderer).validate(context);
  if (errors.length > 0) throw new Error(`${context.episodeId}/${context.brief.id} (${context.brief.renderer}): ${errors.join('; ')}`);
}
