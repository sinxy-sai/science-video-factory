import assert from 'node:assert/strict';
import {episodeManifestSchema} from '../../content/schema';
import {getActiveSceneBeat} from '../../src/motion/scene-beats';

const scene = {
  id: 'demo-scene',
  title: 'Demo',
  claim: 'A claim',
  visual: 'demo',
  durationInFrames: 90,
  beats: [
    {id: 'enter', purpose: 'enter', startFrame: 0, durationInFrames: 24},
    {id: 'focus', purpose: 'focus', startFrame: 24, durationInFrames: 36},
  ],
};

const manifest = episodeManifestSchema.parse({
  id: 'demo-episode',
  title: 'Demo',
  language: 'en',
  format: 'landscape',
  width: 1920,
  height: 1080,
  fps: 30,
  theme: 'clear-science',
  scenes: [scene],
});

assert.deepEqual(getActiveSceneBeat(manifest.scenes[0], 0), {
  beat: scene.beats[0],
  beatProgress: 0,
});
assert.deepEqual(getActiveSceneBeat(manifest.scenes[0], 30), {
  beat: scene.beats[1],
  beatProgress: 6 / 36,
});
assert.deepEqual(getActiveSceneBeat(manifest.scenes[0], 80), {
  beat: null,
  beatProgress: 0,
});

assert.throws(
  () =>
    episodeManifestSchema.parse({
      ...manifest,
      scenes: [
        {
          ...scene,
          beats: [
            {id: 'a', purpose: 'enter', startFrame: 20, durationInFrames: 30},
            {id: 'b', purpose: 'focus', startFrame: 40, durationInFrames: 30},
          ],
        },
      ],
    }),
  /overlap|sorted/i,
);

console.log('storyboard beat contract behaves as expected');
