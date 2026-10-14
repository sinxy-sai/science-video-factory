// Temporary compatibility registry. Run the registry generator to replace this file.
import type {EpisodeModule} from '../episode-module';
import {manifest as howMemoryWorksManifest} from './how-memory-works/manifest';
import {manifest as whatIsTransformerManifest} from './what-is-transformer/manifest';
import {manifest as whySkyBlueManifest} from './why-sky-blue/manifest';

const createModule = (manifest: EpisodeModule['manifest']): EpisodeModule => ({
  manifest,
  renderScene: () => null,
});

const howMemoryWorks = createModule(howMemoryWorksManifest);
const whatIsTransformer = createModule(whatIsTransformerManifest);
const whySkyBlue = createModule(whySkyBlueManifest);

export const episodeRegistry: Record<string, EpisodeModule> = {
  [howMemoryWorks.manifest.id]: howMemoryWorks,
  [whatIsTransformer.manifest.id]: whatIsTransformer,
  [whySkyBlue.manifest.id]: whySkyBlue,
};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
