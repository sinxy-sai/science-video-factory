import {existsSync} from 'node:fs';
import {delimiter, join, resolve} from 'node:path';

export type ProjectDependencyPaths = {
  root: string;
  python: string | null;
  manim: string | null;
  ffmpegBin: string | null;
  ffmpeg: string | null;
  ffprobe: string | null;
};

const firstExisting = (candidates: string[]): string | null => candidates.find((candidate) => existsSync(candidate)) ?? null;

export function resolveDependencyPaths(projectRoot = process.cwd()): ProjectDependencyPaths {
  const root = resolve(projectRoot);
  const windows = process.platform === 'win32';
  const scripts = windows ? 'Scripts' : 'bin';
  const executable = (name: string) => windows ? `${name}.exe` : name;
  const venvBin = join(root, '.venv', scripts);
  const ffmpegBin = firstExisting([
    join(root, 'tools', 'ffmpeg', 'bin'),
    join(root, 'tools', 'ffmpeg'),
  ]);
  return {
    root,
    python: firstExisting([join(venvBin, executable('python')), join(venvBin, executable('python3'))]),
    manim: firstExisting([join(venvBin, executable('manim'))]),
    ffmpegBin,
    ffmpeg: ffmpegBin ? firstExisting([join(ffmpegBin, executable('ffmpeg'))]) : null,
    ffprobe: ffmpegBin ? firstExisting([join(ffmpegBin, executable('ffprobe'))]) : null,
  };
}

export function projectDependencyEnv(projectRoot = process.cwd()): NodeJS.ProcessEnv {
  const paths = resolveDependencyPaths(projectRoot);
  const pathEntries = [paths.ffmpegBin, paths.python ? join(paths.root, process.platform === 'win32' ? '.venv/Scripts' : '.venv/bin') : null, process.env.PATH].filter(Boolean);
  return {...process.env, PATH: pathEntries.join(delimiter)};
}

export function missingProjectDependencies(projectRoot = process.cwd()): string[] {
  const paths = resolveDependencyPaths(projectRoot);
  const missing: string[] = [];
  if (!paths.python) missing.push('project Python (.venv)');
  if (!paths.manim) missing.push('Manim (.venv)');
  if (!paths.ffmpeg) missing.push('FFmpeg (tools/ffmpeg)');
  if (!paths.ffprobe) missing.push('FFprobe (tools/ffmpeg)');
  return missing;
}
