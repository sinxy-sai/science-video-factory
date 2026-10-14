import React from 'react';
import type {SceneManifest} from '../../content/schema';
import {SpectrumDiagram} from '../visuals/SpectrumDiagram';
import {ScatteringDiagram} from '../visuals/ScatteringDiagram';
import {ConnectionDiagram} from '../visuals/ConnectionDiagram';
import {ConclusionDiagram} from '../visuals/ConclusionDiagram';

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
    case 'summary':
      return <ConclusionDiagram />;
    default: {
      const exhaustive: never = scene.visual;
      return exhaustive;
    }
  }
};
