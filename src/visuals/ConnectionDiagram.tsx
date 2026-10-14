import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../theme/theme';

const nodes = [
  {x: 250, y: 180, label: '注意'},
  {x: 600, y: 105, label: '关联'},
  {x: 950, y: 180, label: '重复'},
  {x: 420, y: 365, label: '连接'},
  {x: 790, y: 365, label: '记忆'},
];

const edges = [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 4]];

export const ConnectionDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg viewBox="0 0 1200 500" width="100%" height="100%" role="img" aria-label="神经元连接逐渐形成记忆网络">
      {edges.map(([from, to], index) => {
        const start = nodes[from];
        const end = nodes[to];
        const opacity = interpolate(reveal, [index / edges.length, (index + 1) / edges.length], [0.12, 0.8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <line key={`${from}-${to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={theme.green} strokeWidth="7" strokeLinecap="round" opacity={opacity} />;
      })}
      {nodes.map((node, index) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="42" fill="#16384A" stroke={theme.green} strokeWidth="5" opacity={interpolate(reveal, [index / nodes.length, (index + 1) / nodes.length], [0.25, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          <text x={node.x} y={node.y + 8} textAnchor="middle" className="diagram-label">{node.label}</text>
        </g>
      ))}
      <text x="600" y="470" textAnchor="middle" className="diagram-muted">重复和关联，会让连接变得更稳定</text>
    </svg>
  );
};
