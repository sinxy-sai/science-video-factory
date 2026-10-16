import assert from 'node:assert/strict';
import {getDefaultCompositionMetadata} from '../../src/defaults';

assert.deepEqual(getDefaultCompositionMetadata(), {
  durationInFrames: 1,
  fps: 30,
  width: 1920,
  height: 1080,
});
console.log('default composition metadata is a one-frame 1920x1080 black screen');
