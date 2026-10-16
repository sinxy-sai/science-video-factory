import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {loadShotBriefs} from './workflow-validation';
import {episodeRoot} from './episode-utils';
import {validatePlanning} from '../production/planning';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run author-shots -- <episode-id>'); process.exit(1); }
const root = episodeRoot(episodeId);
validatePlanning(episodeId);
const explicitStyle = process.env.SCIENCE_VIDEO_STYLE;
const episodeStylePath = join(root, 'visual-style.md');
const episodeStyle = readFileSync(episodeStylePath, 'utf8');
const styleName = explicitStyle ?? 'episode-defined';
const style = explicitStyle
  ? (() => {
      const stylePath = resolve('styles', explicitStyle, 'DESIGN.md');
      if (!existsSync(stylePath)) throw new Error(`Unknown explicit style pack: ${explicitStyle}`);
      return readFileSync(stylePath, 'utf8');
    })()
  : episodeStyle;
if (!explicitStyle && style.includes('Define palette')) {
  throw new Error(`${episodeId}: define the topic-specific visual language in visual-style.md before authoring shots`);
}
for (const brief of loadShotBriefs(episodeId)) {
  const shotRoot = join(root, 'hyperframes', brief.id);
  mkdirSync(join(shotRoot, 'assets'), {recursive: true});
  const designPath = join(shotRoot, 'DESIGN.md');
  if (!existsSync(designPath) || readFileSync(designPath, 'utf8').includes('Choose a named')) {
    writeFileSync(designPath, `${style}\n\n## Shot Direction\n\n${brief.visualDirection.composition}\n\nFocal point: ${brief.visualDirection.focalPoint}\n\nMotion: ${brief.motion.entrance}; ${brief.motion.transformation}; ${brief.motion.transition}.\n`, 'utf8');
  }
  console.log(`Authored workspace: ${episodeId}/${brief.id} (${styleName})`);
}
