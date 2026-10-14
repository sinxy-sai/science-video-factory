import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneManifest} from '../../content/schema';
import {ProgressRail} from './ProgressRail';
import {theme} from '../shared/theme/theme';

type SceneFrameProps = {
  scene: SceneManifest;
  sceneIndex: number;
  sceneCount: number;
  children: React.ReactNode;
};

export const SceneFrame: React.FC<SceneFrameProps> = ({scene, sceneIndex, sceneCount, children}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div className="scene-safe" style={{opacity: intro}}>
      <div className="scene-header">
        <div>
          <p className="eyebrow" style={{color: scene.accent ?? theme.primary}}>SCIENCE EXPLAINER</p>
          <h1 className="scene-title">{scene.title}</h1>
          <p className="scene-claim">{scene.claim}</p>
        </div>
        <div className="scene-index">{String(sceneIndex + 1).padStart(2, '0')} / {String(sceneCount).padStart(2, '0')}</div>
      </div>
      <div className="scene-visual">{children}</div>
      <div className="scene-footer">
        {scene.supportingText ? <p className="scene-supporting">{scene.supportingText}</p> : null}
        <ProgressRail progress={frame / Math.max(1, scene.durationInFrames - 1)} />
      </div>
    </div>
  );
};