import React from 'react';
import {z} from 'zod';
import type {EpisodeModule} from '../../episode-module';
import {episodeManifestSchema, sceneSchema} from '../../schema';
import {manifest} from './manifest';
import {TitleCard} from '../../../src/shared/visuals/TitleCard';
import {ConclusionDiagram} from '../../../src/shared/visuals/ConclusionDiagram';
import {SpectrumScene} from './scenes/SpectrumScene';
import {ScatteringScene} from './scenes/ScatteringScene';

const skyVisualSchema = z.enum(['title', 'spectrum', 'scattering', 'comparison', 'summary']);
const localManifestSchema = episodeManifestSchema.safeExtend({
  scenes: z.array(sceneSchema.extend({visual: skyVisualSchema})),
});
const validatedManifest = localManifestSchema.parse(manifest);

export const episode: EpisodeModule = {
  manifest: validatedManifest,
  renderScene: ({scene}) => {
    switch (scene.visual) {
      case 'title': return React.createElement(TitleCard, {accent: scene.accent});
      case 'spectrum': return React.createElement(SpectrumScene);
      case 'scattering': return React.createElement(ScatteringScene);
      case 'comparison': return React.createElement(ScatteringScene, {comparison: true});
      case 'summary': return React.createElement(ConclusionDiagram);
      default: throw new Error(`Unknown why-sky-blue visual: ${scene.visual}`);
    }
  },
};