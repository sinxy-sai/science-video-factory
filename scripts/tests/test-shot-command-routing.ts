import assert from 'node:assert/strict';
import {join} from 'node:path';
import {shotAssetPath, shotOutputPath, shotSourceDirectory} from '../lib/episode-runtime';
import type {ShotBrief} from '../../content/shot-brief';

const brief = {
  id: 'shot-001', sceneId: 'intro', durationInFrames: 120, renderer: 'browser', visualStyle: 'episode-defined',
  title: 'Browser shot', narration: 'Browser shot narration.', visual: 'intro',
  visualDirection: {composition: 'diagram', focalPoint: 'bar', hierarchy: ['bar'], palette: 'dark', typography: 'sans'},
  motion: {entrance: 'rise', transformation: 'grow', exit: 'transition-owned', transition: 'cut', pacing: 'measured'},
  continuity: {leaves: [], inherits: []},
  implementation: {sourceRoot: 'html/shot-001', output: {kind: 'mp4', path: 'renders/demo/shots/shot-001.mp4', width: 1280, height: 720, fps: 30}, composition: 'asset', visualMode: 'svg', files: ['html/shot-001/index.html']},
  qualityChecks: {lint: true, validate: true, inspect: true, animationMap: true, strict: true}, assets: [],
} as ShotBrief;

assert.equal(shotSourceDirectory('demo', brief).endsWith(join('content', 'episodes', 'demo', 'html', 'shot-001')), true);
assert.equal(shotOutputPath('demo', brief).endsWith(join('renders', 'demo', 'shots', 'shot-001.mp4')), true);
assert.equal(shotAssetPath('demo', brief), 'episodes/demo/shots/shot-001.mp4');
console.log('shot command routing behaves as expected');
