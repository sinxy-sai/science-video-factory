import React from 'react';
import {z} from 'zod';
import type {EpisodeModule} from '../../episode-module';
import {episodeManifestSchema, sceneSchema} from '../../schema';
import {manifest} from './manifest';
import {TitleCard} from '../../../src/shared/visuals/TitleCard';
import {ConclusionDiagram} from '../../../src/shared/visuals/ConclusionDiagram';
import {TransformerScene} from './scenes/TransformerScene';

const transformerVisualSchema = z.enum(['title', 'tokens', 'attention', 'parallel', 'stack', 'summary']);
const localManifestSchema = episodeManifestSchema.extend({
  scenes: z.array(sceneSchema.extend({visual: transformerVisualSchema})),
});
const validatedManifest = localManifestSchema.parse(manifest);

export const episode: EpisodeModule = {
  manifest: validatedManifest,
  renderScene: ({scene}) => {
    switch (scene.visual) {
      case 'title': return React.createElement(TitleCard, {accent: scene.accent});
      case 'tokens': return React.createElement(TransformerScene, {mode: "tokens"});
      case 'attention': return React.createElement(TransformerScene, {mode: "attention"});
      case 'parallel': return React.createElement(TransformerScene, {mode: "parallel"});
      case 'stack': return React.createElement(TransformerScene, {mode: "stack"});
      case 'summary': return React.createElement(ConclusionDiagram);
      default: throw new Error(`Unknown what-is-transformer visual: ${scene.visual}`);
    }
  },
};

