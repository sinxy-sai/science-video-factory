import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ensureRenderDir, loadEpisodeManifest, describeManifest} from './episode-utils';
import {probeMedia, validateMediaMetadata} from '../production/media-metadata';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run verify-output -- <episode-id>'); process.exit(1); }
const manifest = await loadEpisodeManifest(episodeId);
const directory = ensureRenderDir(manifest);
const output = join(directory, 'final.mp4');
const metadata = probeMedia(output, manifest);
validateMediaMetadata(metadata, manifest);
writeFileSync(join(directory, 'output-verification.json'), JSON.stringify({episodeId, output, ...metadata, manifest: describeManifest(manifest)}, null, 2) + '\n', 'utf8');
console.log(`Verified output: ${output} (${metadata.width}x${metadata.height}, ${metadata.fps}fps, ${metadata.frames} frames)`);
