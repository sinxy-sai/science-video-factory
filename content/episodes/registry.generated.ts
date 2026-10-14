// GENERATED FILE. Run npm run generate-registry to update.
import type {EpisodeModule} from '../episode-module';
import {episode as howMemoryWorks} from './how-memory-works/episode';
import {episode as whatIsTransformer} from './what-is-transformer/episode';
import {episode as whySkyBlue} from './why-sky-blue/episode';

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
