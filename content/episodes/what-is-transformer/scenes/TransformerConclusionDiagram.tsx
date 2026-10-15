import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../../../../src/shared/theme/theme';

export const TransformerConclusionDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boxes = [
    {label: 'Token', x: 120, color: theme.primary},
    {label: 'Attention', x: 430, color: theme.green},
    {label: '前馈网络', x: 740, color: theme.secondary},
    {label: '下一个 token', x: 1050, color: '#C59BFF'},
  ];

  return (
    <svg viewBox="0 0 1200 460" width="100%" height="100%" role="img" aria-label="Transformer 从 token 到下一个 token 的处理流程">
      <text x="600" y="58" textAnchor="middle" className="diagram-label">Transformer 的核心处理流程</text>
      {boxes.map((box, index) => (
        <React.Fragment key={box.label}>
          <rect x={box.x - 105} y="170" width="210" height="92" rx="18" fill="#16324C" stroke={box.color} strokeWidth="5" opacity={opacity} />
          <text x={box.x} y="226" textAnchor="middle" className="diagram-label" opacity={opacity}>{box.label}</text>
          {index < boxes.length - 1 ? <path d={`M ${box.x + 112} 216 L ${boxes[index + 1].x - 120} 216`} stroke={theme.line} strokeWidth="6" strokeLinecap="round" opacity={opacity} /> : null}
        </React.Fragment>
      ))}
      <text x="600" y="370" textAnchor="middle" className="diagram-muted" opacity={opacity}>用 Attention 建立上下文关系，再逐层计算并预测输出</text>
    </svg>
  );
};
