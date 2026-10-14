import React from 'react';
import {z} from 'zod';
import type {EpisodeModule} from '../../episode-module';
import {episodeManifestSchema, sceneSchema} from '../../schema';
import {manifest} from './manifest';
import {TitleCard} from '../../../src/shared/visuals/TitleCard';
import {ConclusionDiagram} from '../../../src/shared/visuals/ConclusionDiagram';
import {ConnectionScene} from './scenes/ConnectionScene';

const memoryVisualSchema = z.enum(['title', 'connection', 'summary']);
const localManifestSchema = episodeManifestSchema.extend({
  scenes: z.array(sceneSchema.extend({visual: memoryVisualSchema})),
});
const validatedManifest = localManifestSchema.parse(manifest);

export const episode: EpisodeModule = {
  manifest: validatedManifest,
  renderScene: ({scene}) => {
    switch (scene.visual) {
      case 'title': return React.createElement(TitleCard, {accent: scene.accent});
      case 'connection': return React.createElement(ConnectionScene);
      case 'summary': return React.createElement(ConclusionDiagram);
      default: throw new Error(`Unknown how-memory-works visual: ${scene.visual}`);
    }
  },
};

