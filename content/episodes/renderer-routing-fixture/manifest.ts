import type {EpisodeManifest} from '../../schema';

export const manifest: EpisodeManifest = {
  id: 'renderer-routing-fixture',
  title: 'Browser renderer fixture',
  language: 'en',
  format: 'landscape',
  width: 1280,
  height: 720,
  fps: 30,
  theme: 'fixture',
  scenes: [{
    id: 'intro',
    title: 'Browser authored visual',
    claim: 'HTML and SVG can be rendered as a video shot.',
    visual: 'intro',
    durationInFrames: 120,
    beats: [
      {id: 'enter', purpose: 'enter', startFrame: 0, durationInFrames: 30},
      {id: 'resolve', purpose: 'resolve', startFrame: 30, durationInFrames: 90},
    ],
    captions: [{id: 'caption', text: 'Browser authored shot', startFrame: 10, durationInFrames: 100}],
  }],
};
