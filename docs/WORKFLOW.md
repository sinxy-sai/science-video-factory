# 工作流

## 从主题到视频

```text
用户需求和资料
  ↓
知识结构与场景拆解
  ↓
分镜表：视觉关系 + 动画 beats
  ↓
content/episodes/<id>/manifest.ts
  ↓
Schema 校验
  ↓
Remotion Studio 动态预览
  ↓
静帧检查
  ↓
MP4 渲染
```

## 命令

```powershell
npm run new-episode -- my-topic
npm run validate -- my-topic
npm run preview -- my-topic
npm run still -- my-topic --frame 30
npm run render -- my-topic --scale 0.5
npm run delete-episode -- my-topic
```

输出保存在 `renders/<episode-id>/`，并带有 manifest 快照，方便追溯生成输入。

删除视频项目时，`delete-episode` 会同时清理对应的 episode 目录、渲染目录和 `.remotion/<episode-id>.props.json`，然后重新生成 registry。

## 内容原则

- 每场景一个主要知识关系。
- 每场景先写分镜 beats，再写视觉组件。
- 图示直接标注，核心信息不依赖 hover。
- 动画解释变化、过程、因果或对比。
- 4 秒以上的场景至少包含两个有意义的状态变化。
- 先做静态布局，再加帧动画。
- 先用 SVG/CSS，只有需要密集重绘时才使用 Canvas。

## 分镜 beats

每个场景的 `beats` 使用相对场景起点的帧号：

```ts
beats: [
  {id: 'enter', purpose: 'enter', startFrame: 0, durationInFrames: 24},
  {id: 'process', purpose: 'process', startFrame: 24, durationInFrames: 90},
  {id: 'resolve', purpose: 'resolve', startFrame: 114, durationInFrames: 40},
]
```

设计分镜时检查：观众先看到什么？关系如何建立？过程是否经历了两个状态？最后是否有结论或自然转场？

最终视频不渲染调试型进度条。
