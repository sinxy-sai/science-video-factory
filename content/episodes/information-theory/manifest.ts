import type {EpisodeManifest} from '../../schema';
import {LANDSCAPE_PRESET} from '../../presets';
const fps = LANDSCAPE_PRESET.fps;
const shot = (id: string, title: string, claim: string, visual: string, a: string, b: string) => ({
  id, title, claim, visual, durationInFrames: 15 * fps,
  beats: [
    {id: 'enter', purpose: 'enter' as const, startFrame: 0, durationInFrames: 45},
    {id: 'establish', purpose: 'establish' as const, startFrame: 45, durationInFrames: 90},
    {id: 'process', purpose: 'process' as const, startFrame: 135, durationInFrames: 180},
    {id: 'resolve', purpose: 'resolve' as const, startFrame: 315, durationInFrames: 135},
  ],
  captions: [
    {id: `${id}-a`, text: a, startFrame: 15, durationInFrames: 210},
    {id: `${id}-b`, text: b, startFrame: 225, durationInFrames: 210},
  ],
  supportingText: claim,
});
export const manifest: EpisodeManifest = {
  id: 'information-theory', title: '信息论：把不确定性变成可计算的世界', language: 'zh-CN', ...LANDSCAPE_PRESET, theme: 'information-cosmos',
  scenes: [
    shot('possibility','可能性云','信息来自不确定性的减少。','possibility','你以为信息是消息本身。','其实，信息是可能性突然少了一部分。'),
    shot('surprise','惊讶与概率','越不可能的事件，带来的信息越多。','surprise','一枚公平硬币落地，并不惊天动地。','但一颗百万分之一的骰子，足以让你重新估计世界。'),
    shot('entropy','熵：平均惊讶','熵是随机变量平均信息量的度量。','entropy','信息量可以写成负对数概率。','把所有结果按概率加权，得到的就是熵。'),
    shot('logarithm','为什么是对数','独立选择的信息量应该相加，因此使用对数。','logarithm','两次独立选择，组合成四种可能。','可能性相乘，信息量却要相加——对数正好完成转换。'),
    shot('bits','比特：最小的选择','一个比特区分两种等可能状态。','bits','比特不是电脑里的小灯泡。','它是一次二选一：把世界切成两半。'),
    shot('compression','压缩与规律','规律让平均编码长度低于固定长度。','compression','如果每个符号都同样常见，压缩无从下手。','一旦概率不均，短码给高频，长码给低频。'),
    shot('source-code','香农极限','无失真压缩的平均码长不能低于熵。','source-code','熵不是某种算法的成绩。','它是所有无失真压缩都绕不开的下界。'),
    shot('channel','噪声信道','通信的难点是让信息穿过噪声后仍可辨认。','channel','现实中的信道会丢失、翻转、污染符号。','所以发送的不是裸消息，而是带结构的编码。'),
    shot('capacity','容量与冗余','信道容量决定可靠通信的最高速率。','capacity','冗余看似浪费，却给了我们纠错的空间。','可靠通信，就是在速度和噪声之间找到边界。'),
    shot('mutual','互信息','互信息衡量观察一个变量后减少了多少不确定性。','mutual','看到云层，天气的可能性会收缩。','理解，就是让一个变量替另一个变量消除不确定性。'),
    shot('inference','从通信到科学','学习、测量与科学推断都可看作信息更新。','inference','实验不是把真理搬进脑子。','它是在竞争的解释之间，持续重新分配概率。'),
    shot('ending','选择更好的提问','信息论把不确定性变成了可以设计的对象。','ending','我们无法消灭不确定性。','但可以选择更好的表示、编码，以及更值得提出的问题。'),
  ],
};
