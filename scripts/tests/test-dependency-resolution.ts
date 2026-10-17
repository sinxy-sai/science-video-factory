import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {resolveDependencyPaths} from '../lib/project-dependencies';

const root = mkdtempSync(join(tmpdir(), 'science-video-deps-'));
try {
  mkdirSync(join(root, '.venv', 'Scripts'), {recursive: true});
  mkdirSync(join(root, 'tools', 'ffmpeg', 'bin'), {recursive: true});
  writeFileSync(join(root, '.venv', 'Scripts', 'python.exe'), 'python');
  writeFileSync(join(root, '.venv', 'Scripts', 'manim.exe'), 'manim');
  writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', 'ffmpeg.exe'), 'ffmpeg');
  writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', 'ffprobe.exe'), 'ffprobe');

  const paths = resolveDependencyPaths(root);
  assert.equal(paths.python, join(root, '.venv', 'Scripts', 'python.exe'));
  assert.equal(paths.manim, join(root, '.venv', 'Scripts', 'manim.exe'));
  assert.equal(paths.ffmpeg, join(root, 'tools', 'ffmpeg', 'bin', 'ffmpeg.exe'));
  assert.equal(paths.ffprobe, join(root, 'tools', 'ffmpeg', 'bin', 'ffprobe.exe'));
  assert.equal(paths.ffmpegBin, join(root, 'tools', 'ffmpeg', 'bin'));

  rmSync(join(root, '.venv', 'Scripts', 'manim.exe'));
  const fallback = resolveDependencyPaths(root);
  assert.equal(fallback.manim, null);
  console.log('project dependency path resolution behaves as expected');
} finally {
  rmSync(root, {recursive: true, force: true});
}
