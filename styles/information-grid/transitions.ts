import type {StyleTransitions} from '../StylePack';

export const transitions: StyleTransitions = {
  default: 'grid-wipe',
  available: ['grid-wipe', 'line-draw', 'signal-dissolve', 'branch-reveal'],
  durationInFrames: {quick: 12, standard: 18, deliberate: 30},
};

export default transitions;

