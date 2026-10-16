# 工作流

## 从主题到视频

```text
用户需求和资料
  ↓
多轮内容讨论与用户确认
  ↓
content-plan.md + shot-design.md（长文本、批准状态）
  ↓
观众、学习目标与知识关系
  ↓
  完整旁白剧本：content/episodes/<id>/script.md
  ↓
  长分镜表：storyboard.md（镜头语言 + 视觉关系 + 动画 beats + 字幕意图）
  ↓
  每镜 ShotBrief：shot-briefs/shot-*.json（连续性 + 技术路线 + 素材）
  ↓
  每镜实现：HTML/CSS/JavaScript + SVG/Canvas 2D/Three.js-WebGL + GSAP / HyperFrames / Remotion / FFmpeg
  ↓
  静态 hero frame 与动效设计
  ↓
  content/episodes/<id>/manifest.ts
  ↓
  npm run prepare-episode-assets -- <id>
  ↓
  Schema、连续性、分镜一致性与字幕覆盖校验
  ↓
Remotion Studio / HyperFrames preview 动态预览
  ↓
代表帧、节奏和可视化检查
  ↓
Remotion 总合成与 MP4 渲染
```

## 命令

```powershell
npm run create-episode -- my-topic
npm run validate-episode-shots -- my-topic
npm run author-episode-shots -- my-topic
npm run prepare-episode-assets -- my-topic
npm run render-episode-shots -- my-topic
npm run validate-episode -- my-topic
npm run preview-episode -- my-topic
npm run render-still-frame -- my-topic --frame 30
npm run remove-episode -- my-topic
```

`new-episode` 会生成完整目录骨架：`content-plan.md`、`shot-design.md`、`script.md`、`storyboard.md`、`visual-style.md`、`shot-briefs/`、`html/`、`manim/` 和 `assets/generated/`。计划文档必须经过讨论、内容、分镜和制作批准；三分钟视频默认要求每份计划至少 10,000 个字符。

新 episode 默认使用 `browser`。每个镜头在 `html/<shot-id>/` 中直接按官方 HyperFrames skill 编写和检查。Remotion 不绘制镜头内容，只合成已渲染的镜头资产。

`validate-planning` 先检查计划文档和批准状态。默认每份计划至少 10,000 个字符，也可通过 `PLANNING_MIN_CHARS`、`PLANNING_CONTENT_MIN_CHARS` 和 `PLANNING_SHOT_DESIGN_MIN_CHARS` 调整。`validate-shots` 通过 renderer adapter 执行 HyperFrames `check`，覆盖 lint、runtime、layout、motion 和 WCAG 对比度检查；其他 renderer 必须有对应 adapter，否则明确失败。通过后才进入资产准备和最终合成。

`author-shots` 读取当前 episode 的 `visual-style.md`，风格必须根据话题确定。`preview-shots` 启动官方 HyperFrames Studio；`render-shots` 生成 `renders/<episode-id>/shots/shot-*.mp4`；`verify-output` 检查最终 `final.mp4` 并写入 `output-verification.json`。

`contact-sheet` 会把代表帧合成为可审阅的 PNG 接触表；`visual-regression` 可对比 `baselines/` 下的历史帧。 最终 `render-episode` 只接受 `--scale 1`，缩放输出不能写入标准 `final.mp4`；预览请使用 `render-still-frame` 或 Remotion 直接输出到临时路径。`prepare-assets` 会将生成素材统一复制到 `static/episodes/<episode-id>/`，并写入 `assets.manifest.json`。`static/` 是 Remotion 的运行时静态资源根目录，由脚本生成，不作为源素材维护。

输出统一为 `renders/<episode-id>/final.mp4`，并带有 `final.manifest.json` 快照，方便追溯生成输入。不要再使用带多个历史命名的 MP4 文件作为标准输出。

删除视频项目时，`delete-episode` 会同时清理对应的 episode 目录、`static/episodes/<episode-id>/`、`styles/<episode-id>/`（如果存在）、渲染目录和 `.remotion/<episode-id>.props.json`，然后重新生成 registry。共享工具代码不会随 episode 删除。

## 技术分工

- **HTML / CSS / JavaScript**：镜头布局、文字和 UI 视觉。
- **SVG**：图示、路径、箭头、标签和精确矢量元素。
- **Canvas 2D**：粒子、密集重复绘制和程序化纹理。
- **Three.js / WebGL / GLSL**：3D、空间运动、光照和着色器。
- **GSAP**：镜头内动画时间轴、缓动、stagger 和路径编排。
- **HyperFrames**：驱动浏览器镜头、检查、预览和渲染。
- **Remotion**：总时间轴、字幕、转场、镜头资产合成和最终视频。
- **FFmpeg**：编码、封装和音视频复用。

默认不添加音效；字幕仍是分镜契约的一部分。`validate` 会强制检查剧本、分镜、ShotBrief、连续性、实现文件和字幕覆盖率。

## 内容原则

- 每场景一个主要知识关系。
- 每场景先写分镜 beats，再写视觉组件。
- 图示直接标注，核心信息不依赖 hover。
- 动画解释变化、过程、因果或对比。
- 4 秒以上的场景至少包含两个有意义的状态变化。
- 先做静态布局，再加帧动画。
- 先用 SVG/CSS，只有需要密集重绘时才使用 Canvas。
- 不把所有镜头压缩成“标题 + 图表 + 淡入”；每镜要选择合适的镜头语言和动画类型。
- 镜头必须展示状态变化、因果、比较、尺度变化或视线引导中的至少一种。

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

