import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadShotBriefs} from './workflow-validation';

const [episodeId, requestedShot] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run preview-shots -- <episode-id> [shot-id]'); process.exit(1); }
const brief = loadShotBriefs(episodeId).find((item) => !requestedShot || item.id === requestedShot);
if (!brief) throw new Error(`${episodeId}: requested shot not found`);
if (brief.renderer !== 'hyperframes-default') throw new Error(`${episodeId}/${brief.id}: preview-shots only supports hyperframes-default`);
const directory = resolve('content', 'episodes', episodeId, 'hyperframes', brief.id);
if (!existsSync(join(directory, 'index.html'))) throw new Error(`${episodeId}/${brief.id}: missing index.html`);
const cli = resolve('node_modules', '.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
const result = spawnSync(cli, ['preview', directory, '--background', '--no-open'], {stdio: 'inherit', shell: true});
process.exit(result.status ?? 1);
