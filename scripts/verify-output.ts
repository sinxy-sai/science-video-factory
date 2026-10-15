import {existsSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ensureRenderDir, loadEpisodeManifest, describeManifest} from './episode-utils';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run verify-output -- <episode-id>'); process.exit(1); }
const manifest = await loadEpisodeManifest(episodeId);
const directory = ensureRenderDir(manifest);
const output = join(directory, 'final.mp4');
if (!existsSync(output) || statSync(output).size === 0) throw new Error(`${episodeId}: missing renders/${episodeId}/final.mp4`);
writeFileSync(join(directory, 'output-verification.json'), JSON.stringify({episodeId, output, bytes: statSync(output).size, manifest: describeManifest(manifest)}, null, 2) + '\n', 'utf8');
console.log(`Verified output: ${output}`);
