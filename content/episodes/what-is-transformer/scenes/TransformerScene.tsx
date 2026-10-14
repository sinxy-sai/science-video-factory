import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../../../../src/shared/theme/theme';

type TransformerMode = 'tokens' | 'attention' | 'parallel' | 'stack';

const tokens = ['我', '喜欢', '学习', 'AI'];
const tokenColors = ['#55B7FF', '#7FE0B0', '#FFB36B', '#C59BFF'];

export const TransformerScene: React.FC<{mode: TransformerMode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (mode === 'tokens') return <Tokens mode={mode} reveal={reveal} frame={frame} />;
  if (mode === 'attention') return <Attention reveal={reveal} frame={frame} />;
  if (mode === 'parallel') return <Parallel reveal={reveal} frame={frame} />;
  return <Stack reveal={reveal} frame={frame} />;
};

const Tokens: React.FC<{mode: 'tokens'; reveal: number; frame: number}> = ({reveal, frame}) => {
  const outputProgress = interpolate(frame, [75, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg viewBox="0 0 1200 500" width="100%" height="100%" role="img" aria-label="文字被拆分成 token 并转换为向量">
      <text x="600" y="50" textAnchor="middle" className="diagram-label">文字 → token → 向量</text>
      <text x="84" y="118" className="diagram-muted">输入句子</text>
      <text x="84" y="160" className="diagram-label">我喜欢学习 AI</text>
      <line x1="84" y1="205" x2="1115" y2="205" stroke={theme.line} strokeWidth="3" />
      {tokens.map((token, index) => {
        const x = 110 + index * 250;
        const scale = interpolate(reveal, [0, 1], [0.7, 1]);
        return (
          <g key={token} transform={`translate(${x} 260) scale(${scale})`}>
            <rect x="-76" y="-46" width="152" height="92" rx="18" fill={tokenColors[index]} opacity="0.92" />
            <text x="0" y="10" textAnchor="middle" style={{fill: '#07111F', fontSize: 32, fontWeight: 800}}>{token}</text>
            <text x="0" y="91" textAnchor="middle" className="diagram-muted">token {index + 1}</text>
            <path d="M 0 120 L 0 170" stroke={tokenColors[index]} strokeWidth="4" opacity={outputProgress} />
            <rect x="-76" y="178" width="152" height="50" rx="12" fill="#16324C" stroke={tokenColors[index]} strokeWidth="3" opacity={outputProgress} />
            <text x="0" y="211" textAnchor="middle" className="diagram-muted" opacity={outputProgress}>向量</text>
          </g>
        );
      })}
    </svg>
  );
};

const Attention: React.FC<{reveal: number; frame: number}> = ({reveal, frame}) => {
  const pulse = interpolate(frame % 90, [0, 45, 90], [0.55, 1, 0.55]);
  const centers = [180, 420, 660, 900];
  return (
    <svg viewBox="0 0 1200 500" width="100%" height="100%" role="img" aria-label="Self-Attention 让每个 token 参考其他 token">
      <text x="600" y="52" textAnchor="middle" className="diagram-label">每个 token 都会询问：谁和我有关？</text>
      {centers.map((x, index) => (
        <g key={x}>
          {centers.map((target, targetIndex) => {
            if (targetIndex === index) return null;
            const weight = index === 1 && targetIndex === 2 ? 1 : 0.28;
            return <path key={target} d={`M ${x} 250 Q ${(x + target) / 2} ${170 - Math.abs(target - x) / 6} ${target} 250`} fill="none" stroke={index === 1 && targetIndex === 2 ? theme.green : theme.line} strokeWidth={index === 1 && targetIndex === 2 ? 8 : 3} opacity={reveal * weight * pulse} />;
          })}
          <circle cx={x} cy="250" r="52" fill={index === 1 ? '#245F65' : '#16324C'} stroke={index === 1 ? theme.green : theme.primary} strokeWidth="5" opacity={reveal} />
          <text x={x} y="262" textAnchor="middle" className="diagram-label">{tokens[index]}</text>
        </g>
      ))}
      <text x="600" y="410" textAnchor="middle" className="diagram-muted">关系不是固定的，而是由上下文动态计算</text>
      <text x="660" y="145" textAnchor="middle" style={{fill: theme.green, fontSize: 23, fontWeight: 700}} opacity={reveal}>“学习”关注“AI”</text>
    </svg>
  );
};

const Parallel: React.FC<{reveal: number; frame: number}> = ({reveal, frame}) => {
  const progress = interpolate(frame, [20, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const columns = [160, 365, 570, 775, 980];
  return (
    <svg viewBox="0 0 1200 500" width="100%" height="100%" role="img" aria-label="多个 token 进入矩阵并行计算">
      <text x="600" y="50" textAnchor="middle" className="diagram-label">一组 token，一次矩阵计算</text>
      {columns.map((x, index) => {
        const y = 190 + Math.sin(index * 1.4) * 16;
        const dx = interpolate(progress, [0, 1], [0, 180]);
        return (
          <g key={x}>
            <rect x={x - 58} y={y - 38} width="116" height="76" rx="14" fill={tokenColors[index % tokenColors.length]} opacity={0.9} />
            <text x={x} y={y + 9} textAnchor="middle" style={{fill: '#07111F', fontSize: 28, fontWeight: 800}}>{index < 4 ? tokens[index] : '…'}</text>
            <path d={`M ${x + 72} ${y} L ${x + dx + 120} ${y + (index - 2) * 14}`} stroke={theme.secondary} strokeWidth="5" strokeLinecap="round" opacity={reveal * 0.7} />
            <rect x={x + dx + 130} y={y - 34 + (index - 2) * 14} width="58" height="68" rx="10" fill="#16324C" stroke={theme.secondary} strokeWidth="3" opacity={reveal} />
          </g>
        );
      })}
      <text x="600" y="410" textAnchor="middle" className="diagram-muted">GPU 更擅长同时处理一整块矩阵</text>
    </svg>
  );
};

const Stack: React.FC<{reveal: number; frame: number}> = ({reveal, frame}) => {
  const layerProgress = interpolate(frame, [15, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const layers = [
    {label: '输入表示', color: theme.primary},
    {label: 'Self-Attention', color: theme.green},
    {label: '前馈网络', color: theme.secondary},
    {label: 'Self-Attention', color: '#C59BFF'},
    {label: '前馈网络', color: '#F27D9B'},
    {label: '输出概率', color: theme.primary},
  ];
  return (
    <svg viewBox="0 0 1200 500" width="100%" height="100%" role="img" aria-label="Transformer 由多个 block 堆叠而成">
      <text x="600" y="42" textAnchor="middle" className="diagram-label">Transformer = 多层可重复的处理模块</text>
      {layers.map((layer, index) => {
        const y = 86 + index * 58;
        const shift = interpolate(layerProgress, [0, 1], [index % 2 ? 90 : -90, 0]);
        return (
          <g key={`${layer.label}-${index}`} transform={`translate(${shift} 0)`} opacity={interpolate(layerProgress, [index / layers.length, (index + 1) / layers.length], [0.1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
            <rect x="300" y={y} width="600" height="40" rx="12" fill="#122A42" stroke={layer.color} strokeWidth="3" />
            <text x="600" y={y + 27} textAnchor="middle" className="diagram-label" style={{fontSize: 21}}>{layer.label}</text>
            {index < layers.length - 1 ? <path d={`M 600 ${y + 42} L 600 ${y + 57}`} stroke={theme.line} strokeWidth="4" /> : null}
          </g>
        );
      })}
      <text x="600" y="480" textAnchor="middle" className="diagram-muted">层层提炼上下文，最后输出下一个 token 的概率</text>
    </svg>
  );
};
