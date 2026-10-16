import assert from 'node:assert/strict';
import {getRendererAdapter} from '../../production/renderers';

const browser = getRendererAdapter('browser');
assert.equal(browser.id, 'browser');
assert.equal(getRendererAdapter('manim').id, 'manim');
assert.equal(getRendererAdapter('blender').id, 'blender');

const unsupported = getRendererAdapter('manim').validate({
  episodeId: 'demo',
  directory: 'content/episodes/demo/html/shot-001',
  brief: {
    id: 'shot-001', sceneId: 'intro', title: 'demo', narration: 'demo', visual: 'intro', renderer: 'manim', visualStyle: 'episode-defined',
    visualDirection: {composition: 'demo', focalPoint: 'demo', hierarchy: ['demo'], palette: 'demo', typography: 'demo'},
    motion: {entrance: 'demo', transformation: 'demo', exit: 'demo', transition: 'demo', pacing: 'measured'},
    durationInFrames: 30, continuity: {leaves: [], inherits: []},
    implementation: {sourceRoot: 'html/shot-001', output: {kind: 'mp4', path: 'renders/demo/shots/shot-001.mp4', width: 1280, height: 720, fps: 30}, composition: 'asset', visualMode: 'external', files: []},
    qualityChecks: {lint: true, validate: true, inspect: true, animationMap: true, strict: true}, assets: [],
  },
});
assert.equal(unsupported.some((message) => message.includes('not configured')), true);
console.log('renderer adapter routing behaves as expected');
