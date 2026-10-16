import {spawnSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {existsSync, unlinkSync} from 'node:fs';
import {browserArgs, ensureRenderDir, loadEpisodeModule, parseFlag, projectToolEnv, writeManifestSnapshot, writePropsFile} from '../lib/episode-runtime';
import {validatePlanning} from '../../production/planning';

const args = process.argv.slice(2);
const [episodeId] = args;

if (!episodeId) {
  console.error('Usage: npm run render-episode -- <episode-id> [--scale 1]');
  process.exit(1);
}

const {manifest} = await loadEpisodeModule(episodeId);
validatePlanning(episodeId);
const propsPath = writePropsFile(manifest);
const renderDir = ensureRenderDir(manifest);
const outputName = 'final.mp4';
const outputPath = join(renderDir, outputName);
if (existsSync(outputPath)) unlinkSync(outputPath);
writeManifestSnapshot(manifest, renderDir, 'final');

const scale = parseFlag(args, '--scale', '1');
if (scale !== '1') {
  console.error(`Refusing to write scaled output to standard final.mp4 (requested --scale ${scale}). Render final.mp4 at --scale 1; use render-still-frame or direct Remotion for previews.`);
  process.exit(1);
}
const remotionCli = resolve('node_modules', '@remotion', 'cli', 'remotion-cli.js');
const result = spawnSync(process.execPath, [remotionCli, 'render', 'src/entry.ts', 'ScienceVideo', outputPath, `--props=${propsPath}`, `--scale=${scale}`, ...browserArgs()], {
  stdio: 'inherit',
  shell: false,
  env: projectToolEnv(),
});

if (result.status !== 0) process.exit(result.status ?? 1);
if (!existsSync(outputPath)) {
  console.error(`Remotion exited successfully but did not produce ${outputPath}`);
  process.exit(1);
}
process.exit(0);
