import type {EpisodeManifest} from '../../schema';
import {LANDSCAPE_PRESET} from '../../presets';

export const manifest: EpisodeManifest = {
  id: 'how-memory-works',
  title: '记忆是怎样形成的？',
  language: 'zh-CN',
  ...LANDSCAPE_PRESET,
  theme: 'clear-science',
  scenes: [
    {
      id: 'signal',
      title: '记忆从一次信号开始',
      claim: '新的信息首先被神经元活动暂时编码。',
      visual: 'title',
      durationInFrames: 150,
      supportingText: '注意力决定哪些信号会继续留下。',
    },
    {
      id: 'connection',
      title: '连接被反复加强',
      claim: '重复和关联会让神经元之间的连接更稳定。',
      visual: 'connection',
      durationInFrames: 240,
      supportingText: '大脑不是保存一张照片，而是在更新连接。',
      accent: '#7FE0B0',
    },
    {
      id: 'summary',
      title: '记忆是一次持续重建',
      claim: '回忆时，大脑会重新激活并组合这些连接。',
      visual: 'summary',
      durationInFrames: 180,
      supportingText: '每次回忆，都可能让记忆变得更牢，也可能发生偏差。',
      accent: '#7FE0B0',
    },
  ],
};
