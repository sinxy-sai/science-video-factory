import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../../../../src/shared/theme/theme';

export const ScatteringScene: React.FC<{comparison?: boolean}> = ({comparison = false}) => {
  const frame = useCurrentFrame();
  const travel = interpolate(frame, [0, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rayCount = comparison ? 8 : 12;
  const blue = '#55B7FF';
  const orange = '#FFB36B';
  const active = comparison ? orange : blue;
  return (
    <svg viewBox="0 0 1200 520" width="100%" height="100%" role="img" aria-label="光线被空气分子散射">
      <defs>
        <radialGradient id="molecule" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#F5F9FF" />
          <stop offset="100%" stopColor="#55B7FF" />
        </radialGradient>
      </defs>
      <line x1="80" y1="260" x2="1110" y2="260" stroke={theme.line} strokeWidth="4" />
      {[300, 550, 800].map((x, index) => (
        <g key={x}>
          <circle cx={x} cy="260" r="28" fill="url(#molecule)" />
          <text x={x} y="330" textAnchor="middle" className="diagram-muted">空气分子 {index + 1}</text>
        </g>
      ))}
      {Array.from({length: rayCount}).map((_, index) => {
        const offset = (index - (rayCount - 1) / 2) * 18;
        const endX = 900 + Math.cos(index * 0.75) * 180;
        const endY = 260 + Math.sin(index * 0.75) * 170;
        const dash = `${Math.max(0, travel * 700 - index * 32)} 1000`;
        return (
          <path
            key={index}
            d={`M 90 ${260 + offset} L 300 260 L ${endX} ${endY}`}
            fill="none"
            stroke={active}
            strokeWidth={comparison ? 4 : 5}
            strokeLinecap="round"
            strokeDasharray={dash}
            opacity={comparison ? 0.68 : 0.82}
          />
        );
      })}
      <text x="90" y="130" className="diagram-label">入射光</text>
      <text x="865" y="110" className="diagram-label" fill={active}>{comparison ? '较长波长' : '短波长更容易散射'}</text>
      <text x="865" y="145" className="diagram-muted">方向被重新分配</text>
    </svg>
  );
};