import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme/theme';

export const ConclusionDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 45], [80, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = interpolate(frame, [0, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg viewBox="0 0 1200 460" width="100%" height="100%" role="img" aria-label="来自天空各个方向的蓝色散射光">
      <circle cx="600" cy="235" r="112" fill="#183A5A" stroke={theme.primary} strokeWidth="4" />
      <text x="600" y="246" textAnchor="middle" className="diagram-label">观察者</text>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (Math.PI * 2 * index) / 6;
        const x1 = 600 + Math.cos(angle) * 130;
        const y1 = 235 + Math.sin(angle) * 130;
        const x2 = 600 + Math.cos(angle) * 430;
        const y2 = 235 + Math.sin(angle) * 170;
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2 + rise}
            stroke={theme.primary}
            strokeWidth="8"
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
      <text x="600" y="55" textAnchor="middle" className="diagram-label">各个方向的散射蓝光进入眼睛</text>
      <text x="600" y="420" textAnchor="middle" className="diagram-muted">这就是我们看到的蓝天</text>
    </svg>
  );
};

