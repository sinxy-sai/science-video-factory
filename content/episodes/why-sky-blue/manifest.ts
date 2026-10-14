import type {EpisodeManifest} from '../../schema';
import {LANDSCAPE_PRESET} from '../../presets';

export const manifest: EpisodeManifest = {
  id: 'why-sky-blue',
  title: '为什么天空是蓝色的？',
  language: 'zh-CN',
  ...LANDSCAPE_PRESET,
  theme: 'clear-science',
  scenes: [
    {
      id: 'question',
      title: '为什么天空是蓝色的？',
      claim: '白色阳光里其实包含多种颜色。',
      visual: 'title',
      durationInFrames: 150,
      supportingText: '颜色不同，波长也不同。',
    },
    {
      id: 'spectrum',
      title: '阳光不是一种颜色',
      claim: '白光可以分解成从红到紫的连续光谱。',
      visual: 'spectrum',
      durationInFrames: 210,
      supportingText: '每种颜色对应不同的波长。',
    },
    {
      id: 'scattering',
      title: '空气会重新分配光线',
      claim: '短波长的蓝光更容易被空气分子散射。',
      visual: 'scattering',
      durationInFrames: 270,
      supportingText: '蓝光被散射到各个方向，进入我们的眼睛。',
      accent: '#55B7FF',
    },
    {
      id: 'comparison',
      title: '红光和蓝光的差别',
      claim: '波长越短，散射倾向越强。',
      visual: 'comparison',
      durationInFrames: 210,
      supportingText: '这就是瑞利散射的关键。',
      accent: '#FFB36B',
    },
    {
      id: 'conclusion',
      title: '所以天空看起来是蓝色',
      claim: '来自各个方向的散射蓝光，构成了我们看到的蓝天。',
      visual: 'summary',
      durationInFrames: 180,
      supportingText: '日落时光路变长，蓝光被散射得更多，天空会偏红。',
    },
  ],
};
