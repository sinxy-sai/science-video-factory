import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {loadShotBriefs} from '../lib/episode-workflow-validation';
import {getRendererAdapter, validateRenderer} from '../../production/renderers';
import {validatePlanning} from '../../production/planning';

const [episodeId, requestedShot] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run preview-episode-shots -- <episode-id> [shot-id]'); process.exit(1); }
validatePlanning(episodeId);
const brief = loadShotBriefs(episodeId).find((item) => !requestedShot || item.id === requestedShot);
if (!brief) throw new Error(`${episodeId}: requested shot not found`);
const directory = resolve('content', 'episodes', episodeId, 'hyperframes', brief.id);
validateRenderer({episodeId, brief, directory});
process.exit(getRendererAdapter(brief.renderer).run('preview', {episodeId, brief, directory}));
