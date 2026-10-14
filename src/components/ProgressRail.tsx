import React from 'react';
import {interpolate} from 'remotion';
import {theme} from '../shared/theme/theme';

type ProgressRailProps = {
  progress: number;
};

export const ProgressRail: React.FC<ProgressRailProps> = ({progress}) => {
  const scaleX = interpolate(progress, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div className="progress-rail">
      <div className="progress-rail__fill" style={{background: theme.primary, transform: `scaleX(${scaleX})`}} />
    </div>
  );
};
