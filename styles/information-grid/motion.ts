import type {StyleMotion} from '../StylePack';

export const motion: StyleMotion = {
  defaultEasing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  entrance: ['fade-up', 'draw-line', 'stagger-grid'],
  emphasis: ['signal-pulse', 'binary-reveal', 'count-up'],
  exit: ['fade-out', 'grid-dissolve'],
  pacing: {slow: 1.25, measured: 1, fast: 0.75, explosive: 0.55},
};

export default motion;

