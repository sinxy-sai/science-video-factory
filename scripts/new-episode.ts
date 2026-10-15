import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
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
mkdirSync(join(directory, 'scenes'), {recursive: true});
writeFileSync(join(directory, 'assets', '.gitkeep'), '', 'utf8');
writeFileSync(
  join(directory, 'notes.md'),
  `# ${safeId}\n\nDescribe the science claim, source notes, and visual plan here.\n`,
  'utf8',
);
writeFileSync(
  join(directory, 'manifest.ts'),
  `import type {EpisodeManifest} from '../../schema';\nimport {LANDSCAPE_PRESET} from '../../presets';\n\nexport const manifest: EpisodeManifest = {\n  id: '${safeId}',\n  title: 'Replace with a topic',\n  language: 'zh-CN',\n  ...LANDSCAPE_PRESET,\n  theme: 'clear-science',\n  scenes: [\n    {\n      id: 'intro',\n      title: 'Replace with a scene title',\n      claim: 'Replace with one concise knowledge claim.',\n      visual: 'intro',\n      durationInFrames: 150,\n      beats: [\n        {id: 'enter', purpose: 'enter', startFrame: 0, durationInFrames: 24},\n        {id: 'resolve', purpose: 'resolve', startFrame: 24, durationInFrames: 60},\n      ],\n      captions: [\n        {id: 'intro-caption', text: 'Replace with a short spoken line.', startFrame: 18, durationInFrames: 60},\n      ],\n      supportingText: 'Replace with a short explanation.',\n    },\n  ],\n};\n`,
  'utf8',
);
writeFileSync(
  join(directory, 'scenes', 'IntroScene.tsx'),
  `import React from 'react';\n\nexport const IntroScene: React.FC = () => (\n  <div style={{display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#F4F7FB', fontSize: 56}}>\n    Replace with your intro visual\n  </div>\n);\n`,
  'utf8',
);
writeFileSync(
  join(directory, 'episode.ts'),
  `import React from 'react';\nimport {z} from 'zod';\nimport type {EpisodeModule} from '../../episode-module';\nimport {episodeManifestSchema, sceneSchema} from '../../schema';\nimport {manifest} from './manifest';\nimport {IntroScene} from './scenes/IntroScene';\n\nconst localVisualSchema = z.enum(['intro']);\nconst localManifestSchema = episodeManifestSchema.safeExtend({\n  scenes: z.array(sceneSchema.safeExtend({visual: localVisualSchema})),\n});\nconst validatedManifest = localManifestSchema.parse(manifest);\n\nexport const episode: EpisodeModule = {\n  manifest: validatedManifest,\n  renderScene: ({scene}) => {\n    switch (scene.visual) {\n      case 'intro': return React.createElement(IntroScene);\n      default: throw new Error(\`Unknown ${safeId} visual: \${scene.visual}\`);\n    }\n  },\n};\n`,
  'utf8',
);

const result = spawnSync('npm', ['run', 'generate-registry'], {stdio: 'inherit', shell: true});
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Created episode scaffold: ${directory}`);
console.log(`Next commands:`);
console.log(`  npm run validate -- ${safeId}`);
console.log(`  npm run preview -- ${safeId}`);
console.log(`  npm run render -- ${safeId}`);
