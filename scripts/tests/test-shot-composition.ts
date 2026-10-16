import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = readFileSync('src/scenes/ShotAssetScene.tsx', 'utf8');
const renderer = readFileSync('src/scenes/SceneRenderer.tsx', 'utf8');
assert.equal(source.includes('OffthreadVideo'), true);
assert.equal(source.includes('staticFile'), true);
assert.equal(renderer.includes('episode.renderScene'), false);
assert.equal(renderer.includes('ShotAssetScene'), true);
console.log('shot composition uses prepared assets only');
