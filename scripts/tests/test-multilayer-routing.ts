import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {getRendererAdapter} from '../../production/renderers';

const root = mkdtempSync(join(tmpdir(), 'science-video-layered-'));
try {
  const browserDirectory = join(root, 'content', 'episodes', 'demo', 'html', 'shot-001', 'background');
  const manimDirectory = join(root, 'content', 'episodes', 'demo', 'manim', 'shot-001', 'math');
  mkdirSync(browserDirectory, {recursive: true});
  mkdirSync(manimDirectory, {recursive: true});
  writeFileSync(join(browserDirectory, 'index.html'), '<div data-composition-id="shot-001" data-width="1280" data-height="720" data-duration="4"><script>window.__timelines={};</script></div>', 'utf8');
  writeFileSync(join(manimDirectory, 'scene.py'), 'from manim import *\nclass FourierOverlay(Scene):\n    def construct(self):\n        self.wait(1)\n', 'utf8');
  for (const file of ['python.exe', 'manim.exe']) { mkdirSync(join(root, '.venv', 'Scripts'), {recursive: true}); writeFileSync(join(root, '.venv', 'Scripts', file), '', 'utf8'); }
  for (const file of ['ffmpeg.exe', 'ffprobe.exe']) { mkdirSync(join(root, 'tools', 'ffmpeg', 'bin'), {recursive: true}); writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', file), '', 'utf8'); }
  const brief = {
    id: 'shot-001', sceneId: 'intro', title: 'demo', narration: 'demo', visual: 'demo', renderer: 'composite', visualStyle: 'episode-defined',
    visualDirection: {composition: 'demo', focalPoint: 'demo', hierarchy: ['demo'], palette: 'demo', typography: 'demo'},
    motion: {entrance: 'demo', transformation: 'demo', exit: 'demo', transition: 'demo', pacing: 'measured'}, durationInFrames: 120,
    continuity: {leaves: [], inherits: []}, implementation: {
      composition: 'layered', output: {kind: 'mp4', path: join(root, 'renders/demo/shots/shot-001.mp4'), width: 1280, height: 720, fps: 30}, layers: [
        {id: 'background', renderer: 'browser', sourceRoot: 'html/shot-001/background', output: {kind: 'mp4', path: 'background.mp4', width: 1280, height: 720, fps: 30}, visualMode: 'html', files: ['html/shot-001/background/index.html'], zIndex: 0, alpha: false, durationInFrames: 120},
        {id: 'math-overlay', renderer: 'manim', sourceRoot: 'manim/shot-001/math', entryPoint: 'FourierOverlay', output: {kind: 'frame-sequence', path: 'overlay', width: 1280, height: 720, fps: 30, alpha: true}, visualMode: 'external', files: ['manim/shot-001/math/scene.py'], zIndex: 10, alpha: true, durationInFrames: 120},
      ],
    }, qualityChecks: {lint: true, validate: true, inspect: true, animationMap: false, strict: true}, assets: [],
  } as any;
  const errors = getRendererAdapter('composite').validate({episodeId: 'demo', brief, directory: join(root, 'content', 'episodes', 'demo'), projectRoot: root});
  assert.deepEqual(errors, []);
  console.log('multilayer renderer routing behaves as expected');
} finally {
  rmSync(root, {recursive: true, force: true});
}
