import {cpSync, existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {buildShotAssetRecord, validateShotAssetOutput} from '../../production/shot-assets';
import {episodeRoot, loadEpisodeManifest, staticEpisodeRoot} from '../lib/episode-runtime';
import {loadShotBriefs} from '../lib/episode-workflow-validation';

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error('Usage: npm run prepare-episode-assets -- <episode-id>');
  process.exit(1);
}

await loadEpisodeManifest(episodeId);
const sourceRoot = episodeRoot(episodeId);
const destinationRoot = staticEpisodeRoot(episodeId);
if (existsSync(destinationRoot)) rmSync(destinationRoot, {recursive: true, force: true});
mkdirSync(destinationRoot, {recursive: true});

const generatedSource = join(sourceRoot, 'assets', 'generated');
if (existsSync(generatedSource)) cpSync(generatedSource, join(destinationRoot, 'generated'), {recursive: true});

const shotDestination = join(destinationRoot, 'shots');
mkdirSync(shotDestination, {recursive: true});
const records = [];
for (const brief of loadShotBriefs(episodeId)) {
  const errors = validateShotAssetOutput(episodeId, brief);
  if (errors.length > 0) throw new Error(`${episodeId}/${brief.id}: ${errors.join('; ')}`);
  const source = brief.implementation.output.path;
  const extension = brief.implementation.output.kind === 'frame-sequence' ? 'frames' : brief.implementation.output.kind;
  cpSync(source, join(shotDestination, `${brief.id}.${extension}`), {recursive: brief.implementation.output.kind === 'frame-sequence'});
  records.push(buildShotAssetRecord(episodeId, brief));
}
writeFileSync(join(shotDestination, 'assets.manifest.json'), JSON.stringify(records, null, 2) + '\n', 'utf8');
console.log(`Prepared ${records.length} rendered shot assets for ${episodeId}`);
