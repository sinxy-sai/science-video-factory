# 分镜驱动的科普视频工作流设计

## 目标

把 `science-video-factory` 从“每场景一张静态页面加一次淡入”升级为“分镜表驱动的连续动画”。最终视频不包含调试型进度条；每个场景在实现前明确自己的知识关系、动画阶段和节奏。

## 范围

- Remotion 继续作为唯一主合成和输出引擎。
- 每个场景增加显式的 animation beats：进入、建立关系、强调、过程、收束或转场。
- `SceneRenderer` 把当前 beat 和 beat 内进度传给 episode 场景组件。
- 迁移 `what-is-transformer` episode，使每个场景都有可读的 beat 设计。
- 删除最终视频中的 `ProgressRail`。
- 保留 SVG/CSS/Canvas 的现有渲染边界。
- Manim 只作为后续的可选镜头渲染器：输出素材后交给 Remotion 合成，不参与同一条主时间线。

## 非目标

- 字幕属于当前分镜契约的一部分；配音仍为可选扩展，不要求无音频渲染等待音频文件。
- 本阶段不把所有场景重写成 Manim。
- 本阶段不引入 HyperFrames/GSAP 作为 Remotion 组合内的第二条时间线。

## 分镜数据模型

场景新增 `beats` 数组。每个 beat 至少包含：

- `id`：稳定的 kebab-case 标识。
- `purpose`：`enter | establish | focus | process | compare | resolve | transition`。
- `startFrame`：相对于场景起点的帧号。
- `durationInFrames`：beat 持续帧数。

beats 必须按起始帧排序、不能重叠，并且必须落在场景时长内。最后一个 beat 不要求覆盖到场景末尾，但场景需要有明确的收束阶段或静止收束说明。

## 渲染接口

`EpisodeRenderSceneProps` 扩展为：

```ts
{
  scene: SceneManifest;
  frame: number;
  beat: SceneBeat | null;
  beatProgress: number;
}
```

`SceneRenderer` 负责从 manifest 计算当前 beat 和 beat 内进度。episode 场景组件只消费这个时间上下文，不直接重新解释 manifest 的全局时间。

## 视觉和节奏规则

- 场景的第一个 beat 用于建立阅读入口，不能承担全部动画。
- 一个 4 秒以上的场景至少包含两个有意义的状态变化。
- 过程型知识关系必须在画面中经历至少两个可辨认状态。
- 标题、claim 和 supporting text 可以进入和收束，但不能让公共页眉占据全部动效预算。
- 场景底部不再默认渲染进度条。
- 所有运动仍由 `useCurrentFrame`、`interpolate`、`spring` 或等价的确定性帧函数驱动。

## 数据流

```text
用户需求
  ↓
知识结构
  ↓
分镜表：claim + visual relationship + beats
  ↓
manifest.ts
  ↓
episode.ts / scene component
  ↓
Remotion Studio 与动态预览
  ↓
MP4
```

## Manim 集成边界

Manim 适合数学、几何、坐标系、向量和方程推导。为它保留 `renderer: 'remotion' | 'manim'` 的场景级扩展点；Manim 输出先成为视频或图像序列素材，再由 Remotion 管理总时长、字幕、音频和最终封装。

## 验收标准

1. `what-is-transformer` 的 manifest 为每个场景提供 beats。
2. `ProgressRail` 不再出现在渲染结果中。
3. 场景组件能获得当前 beat 和 beat 进度。
4. 至少一个过程型场景在不同 beats 中展示不同视觉状态。
5. 文档明确说明从用户需求到分镜表再到 Remotion 的工作流。
