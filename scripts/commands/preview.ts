import {spawnSync} from 'node:child_process';
import {browserArgs, loadEpisodeModule, writePropsFile} from '../lib/episode-utils';

const [episodeId] = process.argv.slice(2);

if (!episodeId) {
  console.error('Usage: npm run preview -- <episode-id>');
  process.exit(1);
}

const {manifest} = await loadEpisodeModule(episodeId);
const propsPath = writePropsFile(manifest);
const result = spawnSync('npx', ['remotion', 'studio', '--no-open', `--props=${propsPath}`, ...browserArgs()], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
