import assert from 'node:assert/strict';
import {shotBriefSchema} from '../../content/shot-brief';

const base = {
  id: 'shot-001',
  sceneId: 'intro',
  title: 'Browser shot',
  narration: 'A browser-authored shot.',
  visual: 'intro',
  renderer: 'browser',
  visualStyle: 'episode-defined',
  visualDirection: {
    composition: 'Centered diagram',
    focalPoint: 'The SVG bar',
    hierarchy: ['bar', 'label'],
    palette: 'dark blue and mint',
    typography: 'sans serif',
  },
  motion: {
    entrance: 'fade and rise',
    transformation: 'bar grows',
    exit: 'transition-owned',
    transition: 'crossfade',
    pacing: 'measured',
  },
  durationInFrames: 120,
  continuity: {leaves: [], inherits: []},
  implementation: {
    sourceRoot: 'html/shot-001',
    output: {kind: 'mp4', path: 'renders/demo/shots/shot-001.mp4', width: 1280, height: 720, fps: 30},
    composition: 'asset',
    visualMode: 'svg',
    files: ['html/shot-001/index.html'],
  },
  qualityChecks: {lint: true, validate: true, inspect: true, animationMap: true, strict: true},
};

assert.equal(shotBriefSchema.safeParse(base).success, true);
assert.equal(shotBriefSchema.safeParse({...base, renderer: 'remotion-native'}).success, false);
assert.equal(shotBriefSchema.safeParse({...base, implementation: {...base.implementation, sourceRoot: 'hyperframes/shot-001'}}).success, false);
assert.equal(shotBriefSchema.safeParse({...base, renderer: 'manim', implementation: {...base.implementation, sourceRoot: 'manim/shot-001', entryPoint: 'FourierShot', visualMode: 'external'}}).success, true);
assert.equal(shotBriefSchema.safeParse({...base, implementation: {...base.implementation, output: {...base.implementation.output, width: 0}}}).success, false);
console.log('browser shot contract behaves as expected');
