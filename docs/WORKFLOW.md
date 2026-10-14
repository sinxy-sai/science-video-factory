# 工作流

## 从主题到视频

```text
主题和资料
  ↓
知识结构与场景拆解
  ↓
content/episodes/<id>/manifest.ts
  ↓
Schema 校验
  ↓
Remotion Studio 预览
  ↓
静帧检查
  ↓
MP4 渲染
```

## 命令

```powershell
npm run validate -- why-sky-blue
npm run preview -- why-sky-blue
npm run still -- why-sky-blue --frame 30
npm run render -- why-sky-blue --scale 0.5
npm run new-episode -- how-memory-works
```

输出保存在 `renders/<episode-id>/`，并带有 manifest 快照，方便追溯生成输入。

## 内容原则

- 每场景一个主要知识关系。
- 图示直接标注，核心信息不依赖 hover。
- 动画解释变化、过程、因果或对比。
- 先做静态布局，再加帧动画。
- 先用 SVG/CSS，只有需要密集重绘时才使用 Canvas。
