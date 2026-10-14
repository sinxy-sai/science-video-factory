import React from 'react';
import type {SceneManifest} from '../../content/schema';
import {SpectrumScene as SpectrumDiagram} from '../../content/episodes/why-sky-blue/scenes/SpectrumScene';
import {ScatteringScene as ScatteringDiagram} from '../../content/episodes/why-sky-blue/scenes/ScatteringScene';
import {ConnectionScene as ConnectionDiagram} from '../../content/episodes/how-memory-works/scenes/ConnectionScene';
import {ConclusionDiagram} from '../shared/visuals/ConclusionDiagram';
import {TransformerScene as TransformerDiagram} from '../../content/episodes/what-is-transformer/scenes/TransformerScene';

export const SceneRenderer: React.FC<{scene: SceneManifest}> = ({scene}) => {
  switch (scene.visual) {
    case 'title':
      return <div style={{fontSize: 150, color: scene.accent ?? '#55B7FF', fontWeight: 800}}>?</div>;
    case 'spectrum':
      return <SpectrumDiagram />;
    case 'scattering':
      return <ScatteringDiagram />;
    case 'connection':
      return <ConnectionDiagram />;
    case 'comparison':
      return <ScatteringDiagram comparison />;
    case 'tokens':
      return <TransformerDiagram mode="tokens" />;
    case 'attention':
      return <TransformerDiagram mode="attention" />;
    case 'parallel':
      return <TransformerDiagram mode="parallel" />;
    case 'stack':
      return <TransformerDiagram mode="stack" />;
    case 'summary':
      return <ConclusionDiagram />;
    default:
      return null;
  }
};

