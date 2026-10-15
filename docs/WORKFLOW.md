# 工作流

## 从主题到视频

```text
用户需求和资料
  ↓
观众、学习目标与知识关系
  ↓
  完整旁白剧本：content/episodes/<id>/script.md
  ↓
  长分镜表：storyboard.md（镜头语言 + 视觉关系 + 动画 beats + 字幕意图）
  ↓
  每镜 ShotBrief：shot-briefs/shot-*.json（连续性 + 技术路线 + 素材）
  ↓
  每镜实现：Remotion / HyperFrames-GSAP / Manim / SVG-Canvas-WebGL
  ↓
  静态 hero frame 与动效设计
  ↓
  content/episodes/<id>/manifest.ts
  ↓
  npm run prepare-assets -- <id>
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
npm run new-episode -- my-topic
npm run validate-shots -- my-topic
npm run author-shots -- my-topic
npm run prepare-assets -- my-topic
npm run render-shots -- my-topic
npm run validate -- my-topic
npm run preview -- my-topic
npm run still -- my-topic --frame 30
npm run render -- my-topic --scale 0.5
npm run delete-episode -- my-topic
```

`new-episode` 会生成完整目录骨架：`script.md`、`storyboard.md`、`visual-style.md`、`shot-briefs/`、`hyperframes/`、`manim/` 和 `assets/generated/`。

新 episode 默认使用 `hyperframes-default`。每个镜头在 `hyperframes/<shot-id>/` 中直接按官方 HyperFrames skill 编写和检查；`remotion-native` 只能在 ShotBrief 中显式声明。

`validate-shots` 调用 HyperFrames `check`，覆盖 lint、runtime、layout、motion 和 WCAG 对比度检查。通过后才进入资产准备和最终合成。

`author-shots` 应用 `styles/vermilion-editorial/` 默认 Style Pack；`preview-shots` 启动官方 HyperFrames Studio；`render-shots` 生成 `renders/<episode-id>/shots/shot-*.mp4`；`verify-output` 检查最终 `final.mp4` 并写入 `output-verification.json`。

`prepare-assets` 会将生成素材统一复制到 `public/episodes/<episode-id>/`，并写入 `assets.manifest.json`。

输出统一为 `renders/<episode-id>/final.mp4`，并带有 `final.manifest.json` 快照，方便追溯生成输入。不要再使用带多个历史命名的 MP4 文件作为标准输出。

删除视频项目时，`delete-episode` 会同时清理对应的 episode 目录、渲染目录和 `.remotion/<episode-id>.props.json`，然后重新生成 registry。

## 技术分工

- **Remotion**：主时间轴、场景编排、字幕、素材合成和最终 MP4。
- **HyperFrames + GSAP**：复杂 kinetic motion、路径运动、stagger、文字动效和转场；作为镜头级 HTML 动画分支，通过视频或图像序列接入 Remotion。
- **Manim**：公式、几何、坐标系、向量、矩阵和数学推导镜头；输出素材后交给 Remotion 合成。
- **SVG / Canvas / WebGL**：分别处理精确图示、粒子/密集重绘和空间/流场效果。

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
