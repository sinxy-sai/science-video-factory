import {existsSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadEpisodeManifest} from './episode-utils';
import {loadShotBriefs} from './workflow-validation';

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error('Usage: npm run validate-shots -- <episode-id>');
  process.exit(1);
}

await loadEpisodeManifest(episodeId);
const briefs = loadShotBriefs(episodeId);
let failed = false;
const cli = resolve('node_modules', '.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
const animationMap = resolve(process.env.CODEX_HOME ?? '', 'plugins', 'cache', 'openai-api-curated', 'hyperframes', 'd416fd5a', 'skills', 'hyperframes', 'scripts', 'animation-map.mjs');

for (const brief of briefs) {
  if (brief.renderer !== 'hyperframes-default') {
    console.log(`${episodeId}/${brief.id}: renderer=${brief.renderer}, HyperFrames checks skipped`);
    continue;
  }
  const directory = resolve('content', 'episodes', episodeId, 'hyperframes', brief.id);
  if (!existsSync(join(directory, 'index.html'))) {
    console.error(`${episodeId}/${brief.id}: missing hyperframes/${brief.id}/index.html`);
    failed = true;
    continue;
  }
  const result = spawnSync(cli, ['check', directory, ...(brief.qualityChecks.strict ? ['--strict'] : [])], {cwd: directory, stdio: 'inherit', shell: true});
  if (result.status !== 0) { failed = true; console.error(`${episodeId}/${brief.id}: hyperframes check failed`); }
  if (brief.qualityChecks.animationMap && existsSync(animationMap)) {
    const result = spawnSync(process.execPath, [animationMap, directory], {cwd: directory, stdio: 'inherit'});
    if (result.status !== 0) { failed = true; console.error(`${episodeId}/${brief.id}: animation map failed`); }
  }
}

if (failed) process.exit(1);
console.log(`Shot quality checks passed: ${episodeId}`);
