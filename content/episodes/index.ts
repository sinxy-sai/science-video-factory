import {manifest as whySkyBlue} from './why-sky-blue/manifest';
import {manifest as howMemoryWorks} from './how-memory-works/manifest';
import {manifest as whatIsTransformer} from './what-is-transformer/manifest';
import type {EpisodeManifest} from '../schema';

export const episodeManifests: Record<string, EpisodeManifest> = {
  [whySkyBlue.id]: whySkyBlue,
  [howMemoryWorks.id]: howMemoryWorks,
  [whatIsTransformer.id]: whatIsTransformer,
};

export function getEpisodeManifest(id: string): EpisodeManifest {
  const manifest = episodeManifests[id];
  if (!manifest) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeManifests).join(', ')}`);
  }
  return manifest;
}
