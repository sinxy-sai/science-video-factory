import {existsSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {loadShotBriefs} from './workflow-validation';
import {ensureRenderDir, loadEpisodeManifest} from './episode-utils';
import {getRendererAdapter, validateRenderer} from '../production/renderers';
import {validatePlanning} from '../production/planning';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run render-shots -- <episode-id>'); process.exit(1); }
await loadEpisodeManifest(episodeId);
validatePlanning(episodeId);
const outputRoot = join(ensureRenderDir(await loadEpisodeManifest(episodeId)), 'shots');
mkdirSync(outputRoot, {recursive: true});
let failed = false;
for (const brief of loadShotBriefs(episodeId)) {
  const directory = resolve('content', 'episodes', episodeId, 'hyperframes', brief.id);
  const output = join(outputRoot, `${brief.id}.mp4`);
  try { validateRenderer({episodeId, brief, directory, output}); } catch (error) { failed = true; console.error(error instanceof Error ? error.message : error); continue; }
  const status = getRendererAdapter(brief.renderer).run('render', {episodeId, brief, directory, output});
  if (status !== 0 || (brief.renderer === 'hyperframes-default' && !existsSync(output))) { failed = true; console.error(`${episodeId}/${brief.id}: ${brief.renderer} render failed`); }
}
if (failed) process.exit(1);
console.log(`Rendered HyperFrames shots to ${outputRoot}`);
