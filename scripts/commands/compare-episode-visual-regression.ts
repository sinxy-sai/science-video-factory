import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ensureRenderDir, loadEpisodeManifest} from '../lib/episode-runtime';
import {comparePngs, decodePng} from '../../production/visual-regression';

const [episodeId] = process.argv.slice(2);
if (!episodeId) { console.error('Usage: npm run compare-episode-visual-regression -- <episode-id>'); process.exit(1); }
const dir = ensureRenderDir(await loadEpisodeManifest(episodeId));
const baseline = join(dir, 'baselines');
const frameDir = join(dir, 'frames');
const frameFiles = existsSync(frameDir) ? readdirSync(frameDir).filter((file) => file.endsWith('.png')) : [];
const rootFiles = readdirSync(dir).filter((file) => file.endsWith('.png'));
const actual = (frameFiles.length ? frameFiles.map((file) => join(frameDir, file)) : rootFiles.map((file) => join(dir, file)));
if (!actual.length) throw new Error(`${episodeId}: no PNG frames available`);
const threshold = Number(process.env.VISUAL_DIFF_THRESHOLD ?? '0.01');
let checked = 0;
for (const path of actual) {
  const image = decodePng(path);
  if (image.width === 0 || image.height === 0) throw new Error(`Invalid frame: ${path}`);
  const baselinePath = join(baseline, path.split(/[\\/]/).pop()!);
  if (existsSync(baselinePath)) { comparePngs(path, baselinePath, threshold); checked++; }
}
console.log(`Visual regression passed: ${actual.length} frames (${checked} baselines compared)`);
