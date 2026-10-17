# 组件指南

## 组件边界

- `src/components/`：Remotion 级复用组件，例如字幕层和安全区域容器。
- `src/scenes/ShotAssetScene.tsx`：把已准备的镜头资产放入 Remotion 合成；它不负责绘制 HTML、Manim 或 Three.js 镜头。
- `src/compositions/ScienceVideo.tsx`：按 manifest 的 scene 顺序建立 episode 时间轴，并叠加字幕。
- `src/shared/`：仍可存放 Remotion 侧的共享主题或示例视觉，但不作为 browser/Manim 镜头源文件的默认目录。

镜头画面源文件位于 `content/episodes/<episode-id>/html/<shot-id>/` 或 `manim/<shot-id>/`。一个 layered shot 可以把 HTML/CSS/JavaScript、SVG、Canvas 2D、Three.js/WebGL 和 Manim 分成多个图层，在同一 shot 时间线上渲染，再由 FFmpeg 合成；Remotion 通过 `ShotAssetScene` 合成已渲染的镜头资产、字幕和转场。字幕由 Remotion 的 `CaptionLayer` 统一渲染，镜头 HTML 不得重复绘制 ShotBrief 标题、镜头序号或完整 caption；图内只使用少量关系标签，避免默认的 PPT 式大标题布局。旁白、字幕和未来配音 cue 必须对齐同一帧时间轴。

Episode 内容不要直接写进共享 Remotion 组件。浏览器镜头的内容写在 episode 的 HTML/CSS/JavaScript、SVG、Canvas 或 Three.js 源文件中；Manim 内容写在 episode 的 Python 源文件中。Remotion JSX 只负责 episode 级时间轴、字幕、转场和镜头资产承载。

## SVG 优先

SVG 适用于有标签的解释图。使用 `viewBox`、直接标注和少量动画，避免把重要文字画进 Canvas。

## Canvas 与 WebGL 约束

Canvas 2D、Three.js 和 WebGL 镜头由 HyperFrames 的 `hf-seek` 事件驱动，必须能从目标帧确定性重建画面。不能依赖 `Date.now()`、未播种的 `Math.random()`、hover、用户交互或无限循环。需要密集重复绘制时使用 Canvas；需要深度、光照、空间运动或 shader 时使用 Three.js/WebGL。
