// GENERATED FILE. Run npm run generate-episode-registry to update.
import type {EpisodeModule} from '../episode-module';


export const episodeRegistry: Record<string, EpisodeModule> = {

};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
