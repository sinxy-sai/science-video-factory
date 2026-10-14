// GENERATED FILE. Run npm run generate-registry to update.
import type {EpisodeModule} from '../episode-module';
import {episode as episode_how_memory_works} from './how-memory-works/episode';
import {episode as episode_what_is_transformer} from './what-is-transformer/episode';
import {episode as episode_why_sky_blue} from './why-sky-blue/episode';

export const episodeRegistry: Record<string, EpisodeModule> = {
  [episode_how_memory_works.manifest.id]: episode_how_memory_works,
  [episode_what_is_transformer.manifest.id]: episode_what_is_transformer,
  [episode_why_sky_blue.manifest.id]: episode_why_sky_blue,
};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
