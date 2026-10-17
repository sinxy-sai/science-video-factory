import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {ShotBrief} from '../content/shot-brief';
import {shotAssetPath} from '../scripts/lib/episode-runtime';
import {isLayeredImplementation, type VisualMode} from './shot-contract';

export type ShotAssetRecord = {
  id: string;
  sceneId: string;
  renderer: ShotBrief['renderer'];
  visualMode: VisualMode;
  kind: ShotBrief['implementation']['output']['kind'];
  path: string;
  sourcePath: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

export function buildShotAssetRecord(episodeId: string, brief: ShotBrief): ShotAssetRecord {
  const implementation = brief.implementation;
  const visualMode = isLayeredImplementation(implementation) ? 'external' : implementation.visualMode;
  return {id: brief.id, sceneId: brief.sceneId, renderer: brief.renderer, visualMode, kind: implementation.output.kind, path: shotAssetPath(episodeId, brief), sourcePath: implementation.output.path, width: implementation.output.width, height: implementation.output.height, fps: implementation.output.fps, durationInFrames: brief.durationInFrames};
}

export function buildShotAssetManifest(episodeId: string, briefs: ShotBrief[]): ShotAssetRecord[] {
  return briefs.map((brief) => buildShotAssetRecord(episodeId, brief));
}

export function validateShotAssetOutput(_episodeId: string, brief: ShotBrief): string[] {
  const sourcePath = resolve(brief.implementation.output.path);
  return existsSync(sourcePath) ? [] : [`missing rendered shot output: ${sourcePath}`];
}

export function readShotAssetManifest(path: string): ShotAssetRecord[] {
  return JSON.parse(readFileSync(path, 'utf8')) as ShotAssetRecord[];
}
