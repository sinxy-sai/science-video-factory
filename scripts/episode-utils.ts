import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {delimiter, join, resolve} from 'node:path';
import {getEpisodeModule} from '../content/episodes/registry.generated';
import type {EpisodeModule} from '../content/episode-module';
import {totalDurationInFrames, type EpisodeManifest} from '../content/schema';

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertEpisodeId(id: string): string {
  if (!idPattern.test(id)) {
    throw new Error(`Invalid episode id "${id}". Use lowercase kebab-case, for example: my-topic`);
  }
  return id;
}

export async function loadEpisodeModule(id: string): Promise<EpisodeModule> {
  const safeId = assertEpisodeId(id);
  return getEpisodeModule(safeId);
}

export async function loadEpisodeManifest(id: string): Promise<EpisodeManifest> {
  return (await loadEpisodeModule(id)).manifest;
}

export function writePropsFile(manifest: EpisodeManifest): string {
  const tempDir = resolve('.remotion');
  mkdirSync(tempDir, {recursive: true});
  const path = join(tempDir, `${manifest.id}.props.json`);
  writeFileSync(path, JSON.stringify({manifest}, null, 2), 'utf8');
  return path;
}

export function ensureRenderDir(manifest: EpisodeManifest): string {
  const directory = resolve('renders', manifest.id);
  mkdirSync(directory, {recursive: true});
  return directory;
}

export function episodeRoot(id: string): string {
  return resolve('content', 'episodes', assertEpisodeId(id));
}

export function staticEpisodeRoot(id: string): string {
  return resolve('static', 'episodes', assertEpisodeId(id));
}

export function writeManifestSnapshot(manifest: EpisodeManifest, directory: string, filename: string): string {
  const path = join(directory, `${filename}.manifest.json`);
  writeFileSync(path, JSON.stringify(manifest, null, 2), 'utf8');
  return path;
}

export function describeManifest(manifest: EpisodeManifest): string {
  return `${manifest.id}: ${manifest.title} | ${manifest.width}x${manifest.height} @ ${manifest.fps}fps | ${totalDurationInFrames(manifest)} frames`;
}

export function parseFlag(args: string[], flag: string, fallback: string): string {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function pathExists(path: string): boolean {
  return existsSync(path);
}

export function getBrowserExecutable(): string | null {
  const candidate = resolve('node_modules', '.remotion', 'chrome-headless-shell', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
  return existsSync(candidate) ? candidate : null;
}

export function browserArgs(): string[] {
  const executable = getBrowserExecutable();
  return executable ? [`--browser-executable=${executable}`] : [];
}

export function projectToolEnv(): NodeJS.ProcessEnv {
  const ffmpegBin = resolve('tools', 'ffmpeg', 'bin');
  return {
    ...process.env,
    PATH: `${ffmpegBin}${delimiter}${process.env.PATH ?? ''}`,
  };
}
