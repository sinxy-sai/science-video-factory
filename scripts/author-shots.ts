import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {loadShotBriefs} from './workflow-validation';
import {episodeRoot} from './episode-utils';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run author-shots -- <episode-id>'); process.exit(1); }
const root = episodeRoot(episodeId);
const styleName = process.env.SCIENCE_VIDEO_STYLE ?? 'vermilion-editorial';
const stylePath = resolve('styles', styleName, 'DESIGN.md');
if (!existsSync(stylePath)) throw new Error(`Unknown style pack: ${styleName}`);
const style = readFileSync(stylePath, 'utf8');
for (const brief of loadShotBriefs(episodeId)) {
  const shotRoot = join(root, 'hyperframes', brief.id);
  mkdirSync(join(shotRoot, 'assets'), {recursive: true});
  const designPath = join(shotRoot, 'DESIGN.md');
  if (!existsSync(designPath) || readFileSync(designPath, 'utf8').includes('Choose a named')) {
    writeFileSync(designPath, `${style}\n\n## Shot Direction\n\n${brief.visualDirection.composition}\n\nFocal point: ${brief.visualDirection.focalPoint}\n\nMotion: ${brief.motion.entrance}; ${brief.motion.transformation}; ${brief.motion.transition}.\n`, 'utf8');
  }
  console.log(`Authored workspace: ${episodeId}/${brief.id} (${styleName})`);
}
