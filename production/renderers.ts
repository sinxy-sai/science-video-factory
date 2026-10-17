import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {ShotBrief, ShotRenderer} from '../content/shot-brief';
import {implementationFiles, isLayeredImplementation, type ShotLayer} from './shot-contract';
import {buildLayerCompositeArgs, validateCompositeInputs} from './layer-compositor';
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
const requiredSourceFiles = (context: RendererContext) => implementationFiles(context.brief.implementation).map((file) => join(resolve(context.projectRoot ?? '.', 'content', 'episodes', context.episodeId), file));
const checkDeclaredFiles = (context: RendererContext): string[] => requiredSourceFiles(context).filter((file) => !existsSync(file)).map((file) => `missing declared implementation file: ${file}`);

function validateBrowserSource(context: RendererContext): string[] {
  const errors = checkDeclaredFiles(context);
  if (isLayeredImplementation(context.brief.implementation)) return [...errors, 'browser adapter expects a single-layer implementation'];
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
  } else if (!source.includes('window.__timelines') && !source.includes('data-no-timeline')) {
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
  if (isLayeredImplementation(context.brief.implementation)) return [...errors, 'manim adapter expects a single-layer implementation'];
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

export function buildManimRenderArgs(context: RendererContext, sceneFile: string, output: string): string[] {
  if (isLayeredImplementation(context.brief.implementation)) throw new Error('buildManimRenderArgs requires a single-layer Manim brief');
  const projectRoot = resolve(context.projectRoot ?? '.');
  const transparent = context.brief.implementation.output.kind === 'frame-sequence';
  return ['-m', 'manim', 'render', sceneFile, context.brief.implementation.entryPoint ?? '', '--disable_caching', '--media_dir', resolve(projectRoot, 'renders', context.episodeId, 'manim-media'), '--output_file', output, '--resolution', `${context.brief.implementation.output.width},${context.brief.implementation.output.height}`, '--fps', String(context.brief.implementation.output.fps), ...(transparent ? ['--transparent', '--format', 'png-sequence'] : [])];
}

const manim: RendererAdapter = {
  id: 'manim',
  validate: validateManimSource,
  run: (operation, context) => {
    if (isLayeredImplementation(context.brief.implementation)) return 1;
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
        ? buildManimRenderArgs(context, sceneFile, output)
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

function layerBrief(context: RendererContext, layer: ShotLayer): RendererContext {
  return {
    ...context,
    directory: join(resolve(context.projectRoot ?? '.', 'content', 'episodes', context.episodeId), layer.sourceRoot),
    brief: {
      ...context.brief,
      renderer: layer.renderer,
      implementation: {
        sourceRoot: layer.sourceRoot,
        ...(layer.entryPoint ? {entryPoint: layer.entryPoint} : {}),
        output: layer.output,
        composition: 'asset',
        visualMode: layer.visualMode,
        files: layer.files,
      },
    } as ShotBrief,
  };
}

const composite: RendererAdapter = {
  id: 'composite',
  validate: (context) => {
    if (!isLayeredImplementation(context.brief.implementation)) return ['composite renderer requires layered implementation'];
    const errors: string[] = [];
    for (const layer of context.brief.implementation.layers) {
      const adapter = getRendererAdapter(layer.renderer);
      errors.push(...adapter.validate(layerBrief(context, layer)).map((error) => `layer ${layer.id}: ${error}`));
    }
    return errors;
  },
  run: (operation, context) => {
    if (!isLayeredImplementation(context.brief.implementation)) return 1;
    if (operation === 'validate') {
      for (const layer of context.brief.implementation.layers.sort((a, b) => a.zIndex - b.zIndex)) {
        const status = getRendererAdapter(layer.renderer).run('validate', layerBrief(context, layer));
        if (status !== 0) return status;
      }
      return 0;
    }
    if (operation === 'preview') {
      for (const layer of context.brief.implementation.layers.sort((a, b) => a.zIndex - b.zIndex)) {
        const status = getRendererAdapter(layer.renderer).run('preview', layerBrief(context, layer));
        if (status !== 0) return status;
      }
      return 0;
    }
    const projectRoot = resolve(context.projectRoot ?? '.');
    const output = context.output ?? resolve(context.brief.implementation.output.path);
    const renderedLayers = [...context.brief.implementation.layers].sort((a, b) => a.zIndex - b.zIndex).map((layer) => ({
      layer,
      path: resolve(projectRoot, layer.output.path),
    }));
    for (const rendered of renderedLayers) {
      mkdirSync(resolve(rendered.path, '..'), {recursive: true});
      const layerContext = {...layerBrief(context, {...rendered.layer, output: {...rendered.layer.output, path: rendered.path}}), output: rendered.path};
      const status = getRendererAdapter(rendered.layer.renderer).run('render', layerContext);
      if (status !== 0) return status;
    }
    const dependencies = resolveDependencyPaths(projectRoot);
    if (!dependencies.ffmpeg) return 1;
    const inputErrors = validateCompositeInputs(renderedLayers.map(({layer, path}) => ({path, kind: layer.output.kind, alpha: layer.alpha, fps: layer.output.fps, zIndex: layer.zIndex})));
    if (inputErrors.length > 0) return 1;
    mkdirSync(resolve(output, '..'), {recursive: true});
    return spawnSync(dependencies.ffmpeg, buildLayerCompositeArgs({ffmpeg: dependencies.ffmpeg, layers: renderedLayers.map(({layer, path}) => ({path, kind: layer.output.kind, alpha: layer.alpha, fps: layer.output.fps, zIndex: layer.zIndex})), output}), {stdio: 'inherit', shell: true, cwd: projectRoot, env: projectToolEnv(projectRoot)}).status ?? 1;
  },
};

const adapters: Partial<Record<ShotRenderer, RendererAdapter>> = {browser, manim, composite, blender: external('blender')};

export function getRendererAdapter(renderer: ShotRenderer): RendererAdapter {
  const adapter = adapters[renderer];
  if (!adapter) throw new Error(`No renderer adapter registered for ${renderer}`);
  return adapter;
}

export function validateRenderer(context: RendererContext): void {
  const errors = getRendererAdapter(context.brief.renderer).validate(context);
  if (errors.length > 0) throw new Error(`${context.episodeId}/${context.brief.id} (${context.brief.renderer}): ${errors.join('; ')}`);
}
