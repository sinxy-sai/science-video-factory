import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadShotBriefs} from '../lib/episode-workflow-validation';
import {episodeRoot} from '../lib/episode-runtime';
import {validatePlanning} from '../../production/planning';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run author-episode-shots -- <episode-id>'); process.exit(1); }
const root = episodeRoot(episodeId);
validatePlanning(episodeId);
const episodeStylePath = join(root, 'visual-style.md');
const episodeStyle = readFileSync(episodeStylePath, 'utf8');
if (episodeStyle.includes('Define palette')) {
  throw new Error(`${episodeId}: define the topic-specific visual language in visual-style.md before authoring shots`);
}
for (const brief of loadShotBriefs(episodeId)) {
  const shotRoot = join(root, 'hyperframes', brief.id);
  mkdirSync(join(shotRoot, 'assets'), {recursive: true});
  const designPath = join(shotRoot, 'DESIGN.md');
  if (!existsSync(designPath) || readFileSync(designPath, 'utf8').includes('Choose a named')) {
    writeFileSync(designPath, `${episodeStyle}\n\n## Shot Direction\n\n${brief.visualDirection.composition}\n\nFocal point: ${brief.visualDirection.focalPoint}\n\nMotion: ${brief.motion.entrance}; ${brief.motion.transformation}; ${brief.motion.transition}.\n`, 'utf8');
  }
  console.log(`Authored workspace: ${episodeId}/${brief.id} (episode-defined)`);
}
