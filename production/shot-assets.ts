import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {ShotBrief} from '../content/shot-brief';
import {shotAssetPath} from '../scripts/lib/episode-runtime';

export type ShotAssetRecord = {
  id: string;
  sceneId: string;
  renderer: ShotBrief['renderer'];
  visualMode: ShotBrief['implementation']['visualMode'];
  kind: ShotBrief['implementation']['output']['kind'];
  path: string;
  sourcePath: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

export function buildShotAssetRecord(episodeId: string, brief: ShotBrief): ShotAssetRecord {
  return {id: brief.id, sceneId: brief.sceneId, renderer: brief.renderer, visualMode: brief.implementation.visualMode, kind: brief.implementation.output.kind, path: shotAssetPath(episodeId, brief), sourcePath: brief.implementation.output.path, width: brief.implementation.output.width, height: brief.implementation.output.height, fps: brief.implementation.output.fps, durationInFrames: brief.durationInFrames};
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
