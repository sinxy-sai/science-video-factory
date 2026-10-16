import {z} from 'zod';
import type {EpisodeModule} from '../../episode-module';
import {episodeManifestSchema, sceneSchema} from '../../schema';
import {manifest} from './manifest';

const localManifestSchema = episodeManifestSchema.safeExtend({
  scenes: z.array(sceneSchema.safeExtend({visual: z.literal('intro')})),
});

export const episode: EpisodeModule = {manifest: localManifestSchema.parse(manifest)};
