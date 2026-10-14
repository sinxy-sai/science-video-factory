import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../../../../src/shared/theme/theme';

const colors = ['#D94C4C', '#F08B4B', '#F1D34A', '#7FD17D', '#55B7FF', '#6978D8', '#A66BCE'];
const labels = ['红', '橙', '黄', '绿', '蓝', '靛', '紫'];

export const SpectrumScene: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [10, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg viewBox="0 0 1200 420" width="100%" height="100%" role="img" aria-label="由红到紫的可见光谱">
      <text x="600" y="52" textAnchor="middle" className="diagram-label">白光 = 多种不同波长的光</text>
      <g transform="translate(100 130)">
        {colors.map((color, index) => {
          const width = 130;
          const x = index * width;
          const scale = interpolate(reveal, [0, 1], [0.05, 1]);
          return (
            <g key={color} transform={`translate(${x} 0) scale(${scale} 1)`}>
              <rect width={width + 2} height={130} fill={color} opacity={0.9} />
              <text x={width / 2} y={184} textAnchor="middle" className="diagram-label">{labels[index]}</text>
            </g>
          );
        })}
        <line x1="0" x2="910" y1="250" y2="250" stroke={theme.line} strokeWidth="3" />
        <text x="0" y="298" className="diagram-muted">波长较长</text>
        <text x="910" y="298" textAnchor="end" className="diagram-muted">波长较短</text>
      </g>
    </svg>
  );
};


