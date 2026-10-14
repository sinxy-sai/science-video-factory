# 组件指南

## 组件边界

- `src/components/`：跨 episode 复用的布局、进度和文本组件。
- `src/scenes/`：根据 manifest 选择视觉组件的场景层。
- `src/visuals/`：一个明确视觉关系的 SVG 或 Canvas 实现。
- `src/theme/`：颜色和排版 token。

Episode 内容不要直接写进通用组件。通用组件通过 props 接收标题、claim、accent、数据和场景进度。

## SVG 优先

SVG 适用于有标签的解释图。使用 `viewBox`、直接标注和少量动画，避免把重要文字画进 Canvas。

## Canvas 约束

Canvas 只用于密集重复图形或频繁重绘。必须根据 Remotion 当前 frame 计算位置，不能使用 `Date.now()`、`Math.random()` 或无限循环。
