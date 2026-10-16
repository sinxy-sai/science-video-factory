import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {browserArgs, ensureRenderDir, loadEpisodeModule, parseFlag, projectToolEnv, writeManifestSnapshot, writePropsFile} from './episode-utils';
import {validatePlanning} from '../production/planning';

const args = process.argv.slice(2);
const [episodeId] = args;

if (!episodeId) {
  console.error('Usage: npm run render -- <episode-id> [--scale 1]');
  process.exit(1);
}

const {manifest} = await loadEpisodeModule(episodeId);
validatePlanning(episodeId);
const propsPath = writePropsFile(manifest);
const renderDir = ensureRenderDir(manifest);
const outputName = 'final.mp4';
const outputPath = join(renderDir, outputName);
writeManifestSnapshot(manifest, renderDir, 'final');

const scale = parseFlag(args, '--scale', '1');
const result = spawnSync('npx', ['remotion', 'render', 'src/entry.ts', 'ScienceVideo', outputPath, `--props=${propsPath}`, `--scale=${scale}`, ...browserArgs()], {
  stdio: 'inherit',
  shell: true,
  env: projectToolEnv(),
});

process.exit(result.status ?? 1);
