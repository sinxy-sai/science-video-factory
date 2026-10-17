import {existsSync} from 'node:fs';
import {join} from 'node:path';
import type {ShotOutputKind} from './shot-contract';

export type CompositeLayerInput = {
  path: string;
  kind: ShotOutputKind;
  alpha: boolean;
  fps: number;
  zIndex: number;
};

export type LayerCompositeRequest = {
  ffmpeg: string;
  layers: CompositeLayerInput[];
  output: string;
};

export function layerSequencePattern(path: string): string {
  return join(path, '%04d.png');
}

export function buildLayerCompositeArgs(request: LayerCompositeRequest): string[] {
  const layers = [...request.layers].sort((a, b) => a.zIndex - b.zIndex);
  if (layers.length < 2) throw new Error('layered shot requires at least two rendered layers');
  const args = ['-y'];
  for (const layer of layers) {
    if (layer.kind === 'frame-sequence') args.push('-framerate', String(layer.fps));
    args.push('-i', layer.kind === 'frame-sequence' ? layerSequencePattern(layer.path) : layer.path);
  }
  const chains = ['[0:v]format=rgba[base]'];
  for (let index = 0; index < layers.length - 1; index += 1) {
    chains.push(`[${index + 1}:v]format=rgba[overlay${index}]`);
    const left = index === 0 ? '[base]' : `[composite${index - 1}]`;
    const right = `[overlay${index}]`;
    const target = index === layers.length - 2 ? '[video]' : `[composite${index}]`;
    chains.push(`${left}${right}overlay=eof_action=pass:shortest=0${target}`);
  }
  return [...args, '-filter_complex', chains.join(';'), '-map', '[video]', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', request.output];
}

export function validateCompositeInputs(layers: CompositeLayerInput[]): string[] {
  return layers.filter((layer) => !existsSync(layer.path)).map((layer) => `missing rendered layer input: ${layer.path}`);
}
