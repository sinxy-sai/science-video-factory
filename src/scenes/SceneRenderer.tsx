import React from 'react';
import type {SceneManifest} from '../../content/schema';
import {SpectrumDiagram} from '../visuals/SpectrumDiagram';
import {ScatteringDiagram} from '../visuals/ScatteringDiagram';
import {ConnectionDiagram} from '../visuals/ConnectionDiagram';
import {ConclusionDiagram} from '../visuals/ConclusionDiagram';
import {TransformerDiagram} from '../visuals/TransformerDiagram';

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
    case 'transformer-tokens':
      return <TransformerDiagram mode="tokens" />;
    case 'transformer-attention':
      return <TransformerDiagram mode="attention" />;
    case 'transformer-parallel':
      return <TransformerDiagram mode="parallel" />;
    case 'transformer-stack':
      return <TransformerDiagram mode="stack" />;
    case 'summary':
      return <ConclusionDiagram />;
    default:
      return null;
  }
};
