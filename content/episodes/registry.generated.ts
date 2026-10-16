// GENERATED FILE. Run npm run generate-episode-registry to update.
import type {EpisodeModule} from '../episode-module';
import {episode as episode_renderer_routing_fixture} from './renderer-routing-fixture/episode';

export const episodeRegistry: Record<string, EpisodeModule> = {
  [episode_renderer_routing_fixture.manifest.id]: episode_renderer_routing_fixture,
};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
