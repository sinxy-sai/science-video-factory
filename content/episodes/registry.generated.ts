// GENERATED FILE. Run npm run generate-episode-registry to update.
import type {EpisodeModule} from '../episode-module';
import {episode as episode_information_theory} from './information-theory/episode';

export const episodeRegistry: Record<string, EpisodeModule> = {
  [episode_information_theory.manifest.id]: episode_information_theory,
};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
