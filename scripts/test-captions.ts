import assert from 'node:assert/strict';
import {episodeManifestSchema} from '../content/schema';
import {getActiveCaption} from '../src/motion/captions';

const manifest = episodeManifestSchema.parse({
  id: 'caption-demo',
  title: 'Caption demo',
  language: 'zh-CN',
  format: 'landscape',
  width: 1920,
  height: 1080,
  fps: 30,
  theme: 'clear-science',
  scenes: [
    {
      id: 'intro',
      title: 'Intro',
      claim: 'Claim',
      visual: 'intro',
      durationInFrames: 90,
      beats: [{id: 'enter', purpose: 'enter', startFrame: 0, durationInFrames: 30}],
      captions: [
        {id: 'line-1', text: '第一句字幕', startFrame: 0, durationInFrames: 30},
        {id: 'line-2', text: '第二句字幕', startFrame: 30, durationInFrames: 30},
      ],
    },
  ],
});

assert.equal(getActiveCaption(manifest.scenes[0], 15)?.text, '第一句字幕');
assert.equal(getActiveCaption(manifest.scenes[0], 45)?.text, '第二句字幕');
assert.equal(getActiveCaption(manifest.scenes[0], 75), null);

assert.throws(
  () =>
    episodeManifestSchema.parse({
      ...manifest,
      scenes: [{
        ...manifest.scenes[0],
        captions: [{id: 'bad', text: '越界', startFrame: 80, durationInFrames: 30}],
      }],
    }),
  /caption must fit within scene duration/i,
);

console.log('caption contract behaves as expected');
