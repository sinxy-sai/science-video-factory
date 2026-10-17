# 组件指南

## 组件边界

- `src/components/`：跨 episode 复用的布局、进度和文本组件。
- `src/scenes/`：根据 manifest 选择视觉组件的场景层。
- `src/visuals/`：一个明确视觉关系的 SVG 或 Canvas 实现。
- `src/theme/`：颜色和排版 token。

镜头画面源文件位于 `content/episodes/<episode-id>/html/<shot-id>/` 或 `manim/<shot-id>/`。一个 layered shot 可以把 HTML/CSS/JavaScript、SVG、Canvas 2D、Three.js/WebGL 和 Manim 分成多个图层，在同一 shot 时间线上渲染，再由 FFmpeg 合成；Remotion 通过 `ShotAssetScene` 合成已渲染的镜头资产、字幕和转场。字幕由 Remotion 的 CaptionLayer 统一渲染，镜头 HTML 不得重复绘制 ShotBrief 标题、镜头序号或完整 caption；图内只使用少量关系标签，避免默认的 PPT 式大标题布局。旁白、字幕和配音 cue 必须对齐同一帧时间轴。

Episode 内容不要直接写进通用组件。通用组件通过 props 接收标题、claim、accent、数据和场景进度。镜头视觉不要再通过 Remotion scene JSX 绘制。

## SVG 优先

SVG 适用于有标签的解释图。使用 `viewBox`、直接标注和少量动画，避免把重要文字画进 Canvas。

## Canvas 约束

Canvas 只用于密集重复图形或频繁重绘。必须根据 Remotion 当前 frame 计算位置，不能使用 `Date.now()`、`Math.random()` 或无限循环。
