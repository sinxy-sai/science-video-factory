import {existsSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadShotBriefs} from './workflow-validation';
import {ensureRenderDir, loadEpisodeManifest, projectToolEnv} from './episode-utils';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run render-shots -- <episode-id>'); process.exit(1); }
await loadEpisodeManifest(episodeId);
const outputRoot = join(ensureRenderDir(await loadEpisodeManifest(episodeId)), 'shots');
mkdirSync(outputRoot, {recursive: true});
let failed = false;
const cli = resolve('node_modules', '.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
for (const brief of loadShotBriefs(episodeId)) {
  if (brief.renderer !== 'hyperframes-default') continue;
  const directory = resolve('content', 'episodes', episodeId, 'hyperframes', brief.id);
  const output = join(outputRoot, `${brief.id}.mp4`);
  const result = spawnSync(cli, ['render', directory, '--output', output, '--quality', 'delivery', '--strict'], {stdio: 'inherit', shell: true, env: projectToolEnv()});
  if (result.status !== 0 || !existsSync(output)) { failed = true; console.error(`${episodeId}/${brief.id}: render failed`); }
}
if (failed) process.exit(1);
console.log(`Rendered HyperFrames shots to ${outputRoot}`);
