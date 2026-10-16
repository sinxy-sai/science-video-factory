import {episodeRegistry} from '../../content/episodes/registry.generated';
import {describeManifest} from '../lib/episode-utils';
import {validateWorkflow} from '../lib/workflow-validation';

let failed = false;
for (const id of Object.keys(episodeRegistry)) {
  try {
    const {manifest} = episodeRegistry[id];
    validateWorkflow(episodeRegistry[id]);
    console.log(`Valid manifest: ${describeManifest(manifest)}`);
    console.log(`Scenes: ${manifest.scenes.map((scene) => scene.id).join(' → ')}`);
  } catch (error) {
    failed = true;
    console.error(`${id}:`, error instanceof Error ? error.message : error);
  }
}

if (failed) {
  process.exit(1);
}
