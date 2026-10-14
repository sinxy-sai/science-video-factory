import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {assertEpisodeId} from './episode-utils';

const [episodeId] = process.argv.slice(2);

if (!episodeId) {
  console.error('Usage: npm run new-episode -- <episode-id>');
  process.exit(1);
}

const safeId = assertEpisodeId(episodeId);
const directory = join('content', 'episodes', safeId);

if (existsSync(directory)) {
  console.error(`Episode already exists: ${safeId}`);
  process.exit(1);
}

mkdirSync(join(directory, 'assets'), {recursive: true});
writeFileSync(join(directory, 'assets', '.gitkeep'), '', 'utf8');
writeFileSync(
  join(directory, 'notes.md'),
  `# ${safeId}\n\nDescribe the science claim, source notes, and visual plan here.\n`,
  'utf8',
);
writeFileSync(
  join(directory, 'manifest.ts'),
  `import type {EpisodeManifest} from '../../schema';\nimport {LANDSCAPE_PRESET} from '../../presets';\n\nexport const manifest: EpisodeManifest = {\n  id: '${safeId}',\n  title: 'Replace with a topic',\n  language: 'zh-CN',\n  ...LANDSCAPE_PRESET,\n  theme: 'clear-science',\n  scenes: [\n    {\n      id: 'intro',\n      title: 'Replace with a scene title',\n      claim: 'Replace with one concise knowledge claim.',\n      visual: 'title',\n      durationInFrames: 150,\n      supportingText: 'Replace with a short explanation.',\n    },\n  ],\n};\n`,
  'utf8',
);

console.log(`Created episode scaffold: ${directory}`);
console.log(`Add it to content/episodes/index.ts before previewing or rendering.`);
