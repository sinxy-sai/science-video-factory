import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {browserArgs, ensureRenderDir, loadEpisodeModule, parseFlag, projectToolEnv, writeManifestSnapshot, writePropsFile} from './episode-utils';

const args = process.argv.slice(2);
const [episodeId] = args;

if (!episodeId) {
  console.error('Usage: npm run still -- <episode-id> --frame 30');
  process.exit(1);
}

const {manifest} = await loadEpisodeModule(episodeId);
const propsPath = writePropsFile(manifest);
const renderDir = ensureRenderDir(manifest);
const frame = parseFlag(args, '--frame', '0');
const outputName = `${manifest.id}-frame-${frame}.png`;
const outputPath = join(renderDir, outputName);
writeManifestSnapshot(manifest, renderDir, outputName.replace(/\.png$/, ''));

const result = spawnSync('npx', ['remotion', 'still', 'src/entry.ts', 'ScienceVideo', outputPath, `--props=${propsPath}`, '--scale=0.5', `--frame=${frame}`, ...browserArgs()], {
  stdio: 'inherit',
  shell: true,
  env: projectToolEnv(),
});

process.exit(result.status ?? 1);
