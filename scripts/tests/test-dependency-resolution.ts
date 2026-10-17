import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {resolveDependencyPaths} from '../lib/project-dependencies';

const root = mkdtempSync(join(tmpdir(), 'science-video-deps-'));
try {
  const scriptsDirectory = process.platform === 'win32' ? 'Scripts' : 'bin';
  const executable = (name: string) => process.platform === 'win32' ? `${name}.exe` : name;
  mkdirSync(join(root, '.venv', scriptsDirectory), {recursive: true});
  mkdirSync(join(root, 'tools', 'ffmpeg', 'bin'), {recursive: true});
  writeFileSync(join(root, '.venv', scriptsDirectory, executable('python')), 'python');
  writeFileSync(join(root, '.venv', scriptsDirectory, executable('manim')), 'manim');
  writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', executable('ffmpeg')), 'ffmpeg');
  writeFileSync(join(root, 'tools', 'ffmpeg', 'bin', executable('ffprobe')), 'ffprobe');

  const paths = resolveDependencyPaths(root);
  assert.equal(paths.python, join(root, '.venv', scriptsDirectory, executable('python')));
  assert.equal(paths.manim, join(root, '.venv', scriptsDirectory, executable('manim')));
  assert.equal(paths.ffmpeg, join(root, 'tools', 'ffmpeg', 'bin', executable('ffmpeg')));
  assert.equal(paths.ffprobe, join(root, 'tools', 'ffmpeg', 'bin', executable('ffprobe')));
  assert.equal(paths.ffmpegBin, join(root, 'tools', 'ffmpeg', 'bin'));

  rmSync(join(root, '.venv', scriptsDirectory, executable('manim')));
  const fallback = resolveDependencyPaths(root);
  assert.equal(fallback.manim, null);
  console.log('project dependency path resolution behaves as expected');
} finally {
  rmSync(root, {recursive: true, force: true});
}
