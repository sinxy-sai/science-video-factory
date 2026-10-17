import assert from 'node:assert/strict';
import {buildLayerCompositeArgs} from '../../production/layer-compositor';

const args = buildLayerCompositeArgs({
  ffmpeg: 'tools/ffmpeg/bin/ffmpeg.exe',
  layers: [
    {path: 'renders/demo/layers/shot-001/background.mp4', kind: 'mp4', alpha: false, fps: 30, zIndex: 0},
    {path: 'renders/demo/layers/shot-001/math', kind: 'frame-sequence', alpha: true, fps: 30, zIndex: 10},
  ],
  output: 'renders/demo/shots/shot-001.mp4',
});
assert.deepEqual(args.slice(0, 5), ['-y', '-i', 'renders/demo/layers/shot-001/background.mp4', '-framerate', '30']);
assert.equal(args.some((arg) => arg.split('\\').join('/') === 'renders/demo/layers/shot-001/math/%04d.png'), true);
assert.equal(args.includes('renders/demo/shots/shot-001.mp4'), true);
assert.equal(args.includes('-filter_complex'), true);
assert.equal(args.some((arg) => arg.includes('eof_action=pass')), true);
console.log('layer compositor command behaves as expected');
