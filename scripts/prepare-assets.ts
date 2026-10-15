import {cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import {episodeRoot, loadEpisodeManifest, staticEpisodeRoot} from './episode-utils';

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error('Usage: npm run prepare-assets -- <episode-id>');
  process.exit(1);
}

await loadEpisodeManifest(episodeId);
const sourceRoot = episodeRoot(episodeId);
const destinationRoot = staticEpisodeRoot(episodeId);
if (existsSync(destinationRoot)) rmSync(destinationRoot, {recursive: true, force: true});
mkdirSync(destinationRoot, {recursive: true});

const sources = [
  ['generated', join(sourceRoot, 'assets', 'generated')],
  ['hyperframes', join(sourceRoot, 'hyperframes')],
  ['manim', join(sourceRoot, 'manim')],
] as const;
const files: Array<{source: string; destination: string}> = [];
for (const [name, source] of sources) {
  if (!existsSync(source)) continue;
  const destination = join(destinationRoot, name);
  cpSync(source, destination, {recursive: true});
  for (const file of readdirSync(destination, {recursive: true, withFileTypes: true})) {
    if (file.isFile()) {
      const full = join(file.parentPath ?? destination, file.name);
      files.push({source: relative(resolve(), join(source, relative(destination, full))), destination: relative(resolve(), full)});
    }
  }
}
const shotRenderRoot = resolve('renders', episodeId, 'shots');
if (existsSync(shotRenderRoot)) {
  const destination = join(destinationRoot, 'shots');
  cpSync(shotRenderRoot, destination, {recursive: true});
  for (const file of readdirSync(destination, {recursive: true, withFileTypes: true})) {
    if (file.isFile()) {
      const full = join(file.parentPath ?? destination, file.name);
      files.push({source: relative(resolve(), join(shotRenderRoot, relative(destination, full))), destination: relative(resolve(), full)});
    }
  }
}
writeFileSync(join(destinationRoot, 'assets.manifest.json'), JSON.stringify({episodeId, files}, null, 2) + '\n', 'utf8');
console.log(`Prepared ${files.length} assets for ${episodeId}`);
