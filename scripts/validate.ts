import {describeManifest, loadEpisodeModule} from './episode-utils';
import {validateWorkflow} from './workflow-validation';

const [episodeId] = process.argv.slice(2);

if (!episodeId) {
  console.error('Usage: npm run validate -- <episode-id>');
  process.exit(1);
}

try {
  const episode = await loadEpisodeModule(episodeId);
  validateWorkflow(episode);
  const {manifest} = episode;
  console.log(`Valid manifest: ${describeManifest(manifest)}`);
  console.log(`Scenes: ${manifest.scenes.map((scene) => scene.id).join(' → ')}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
