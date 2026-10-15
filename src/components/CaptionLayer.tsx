import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneManifest} from '../../content/schema';
import {getActiveCaption} from '../motion/captions';

export const CaptionLayer: React.FC<{scene: SceneManifest}> = ({scene}) => {
  const frame = useCurrentFrame();
  const caption = getActiveCaption(scene, frame);
  if (!caption) return null;

  const localFrame = frame - caption.startFrame;
  const opacity = interpolate(localFrame, [0, 5, caption.durationInFrames - 5, caption.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div className="caption-layer" style={{opacity}}>
      <span className="caption-layer__text">{caption.text}</span>
    </div>
  );
};
