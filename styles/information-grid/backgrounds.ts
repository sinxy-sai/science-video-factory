import type {StyleBackgrounds} from '../StylePack';

export const backgrounds: StyleBackgrounds = {
  base: '#07111F',
  grid: 'linear-gradient(#17304A 1px, transparent 1px), linear-gradient(90deg, #17304A 1px, transparent 1px)',
  gradients: {
    vignette: 'radial-gradient(circle at 50% 35%, #10243A 0%, #07111F 72%)',
    signal: 'linear-gradient(90deg, #48D7C4, #8BB8E8)',
  },
  textures: {fineGrid: '8px 8px', coarseGrid: '32px 32px'},
};

export default backgrounds;

