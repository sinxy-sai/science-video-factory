import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {browserArgs, ensureRenderDir, loadEpisodeModule, parseFlag, writeManifestSnapshot, writePropsFile} from './episode-utils';

const args = process.argv.slice(2);
const [episodeId] = args;

if (!episodeId) {
  console.error('Usage: npm run render -- <episode-id> [--scale 1]');
  process.exit(1);
}

const {manifest} = await loadEpisodeModule(episodeId);
const propsPath = writePropsFile(manifest);
const renderDir = ensureRenderDir(manifest);
const outputName = `${manifest.id}-${manifest.format}-${manifest.width}x${manifest.height}.mp4`;
const outputPath = join(renderDir, outputName);
writeManifestSnapshot(manifest, renderDir, outputName.replace(/\.mp4$/, ''));

const scale = parseFlag(args, '--scale', '1');
const result = spawnSync('npx', ['remotion', 'render', 'src/entry.ts', 'ScienceVideo', outputPath, `--props=${propsPath}`, `--scale=${scale}`, ...browserArgs()], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
