import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {getRendererAdapter} from '../../production/renderers';

const root = mkdtempSync(join(tmpdir(), 'science-video-manim-'));
try {
  const source = join(root, 'content', 'episodes', 'demo', 'manim', 'shot-001');
  mkdirSync(source, {recursive: true});
  mkdirSync(join(root, '.venv', 'Scripts'), {recursive: true});
  mkdirSync(join(root, 'tools', 'ffmpeg', 'bin'), {recursive: true});
  for (const dependency of ['python.exe', 'manim.exe']) writeFileSync(join(root, '.venv', 'Scripts', dependency), '', 'utf8');
  for (const dependency of ['ffmpeg.exe', 'ffprobe.exe']) writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', dependency), '', 'utf8');
  const file = join(source, 'scene.py');
  writeFileSync(file, 'from manim import *\n\nclass FourierShot(Scene):\n    def construct(self):\n        self.wait(1)\n', 'utf8');
  const brief = {
    id: 'shot-001', sceneId: 'intro', title: 'demo', narration: 'demo', visual: 'intro', renderer: 'manim', visualStyle: 'episode-defined',
    visualDirection: {composition: 'demo', focalPoint: 'demo', hierarchy: ['demo'], palette: 'demo', typography: 'demo'},
    motion: {entrance: 'demo', transformation: 'demo', exit: 'demo', transition: 'demo', pacing: 'measured'},
    durationInFrames: 30, continuity: {leaves: [], inherits: []},
    implementation: {sourceRoot: 'manim/shot-001', entryPoint: 'FourierShot', output: {kind: 'mp4', path: join(root, 'renders/demo/shots/shot-001.mp4'), width: 1280, height: 720, fps: 30}, composition: 'asset', visualMode: 'external', files: ['manim/shot-001/scene.py']},
    qualityChecks: {lint: true, validate: true, inspect: true, animationMap: true, strict: true}, assets: [],
  } as any;
  const errors = getRendererAdapter('manim').validate({episodeId: 'demo', directory: source, brief, projectRoot: root});
  assert.deepEqual(errors, []);
  writeFileSync(file, 'from manim import *\n\nclass OtherShot(Scene):\n    def construct(self):\n        pass\n', 'utf8');
  assert.equal(getRendererAdapter('manim').validate({episodeId: 'demo', directory: source, brief, projectRoot: root}).some((message) => message.includes('entryPoint')), true);
  console.log('manim adapter contract behaves as expected');
} finally {
  rmSync(root, {recursive: true, force: true});
}
