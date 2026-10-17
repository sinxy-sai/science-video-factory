# 场景指南

每个 episode 是自包含模块，目录至少包含 `script.md`、`storyboard.md`、`visual-style.md`、`shot-briefs/`、`manifest.ts`、`episode.ts`、`scenes/`、`assets/generated/`、`html/` 和 `manim/`。`html/<shot-id>/index.html` 是镜头画面源文件；它可以组合 HTML/CSS/JavaScript、SVG、Canvas 2D 或 Three.js/WebGL，并用 GSAP 编排确定性动画。HyperFrames 检查、预览并渲染这些浏览器镜头，Remotion 只合成已准备的镜头资产、字幕和转场。生成的 `content/episodes/registry.generated.ts` 通过静态 import 收集所有 episode，命令行和 Remotion 都从这个 registry 加载模块。

### ShotBrief 契约

每个 manifest scene 必须对应一个 `shot-briefs/shot-*.json`。ShotBrief 至少描述：

- `sceneId`、`title`、`narration`、`visual`、`durationInFrames`
- `continuity.inherits` 和 `continuity.leaves`
- `renderer`、`implementation.sourceRoot`、`implementation.files`
- `implementation.visualMode`、`implementation.composition` 和 `implementation.output`
- 该镜头的连续性、质量检查和已声明资产

镜头之间的连续性必须可追溯：下一镜声明继承的对象，必须由上一镜声明留下。

每个场景由以下内容组成：

- `title`：一句可读的场景标题。
- `claim`：这一场景要让观众记住的知识主张。
- `visual`：由当前 episode 的本地 `z.enum([...])` 定义的视觉类型。
- `durationInFrames`：整数帧数，和 episode 的 fps 一起决定时长。
- `beats`：按场景局部帧定义的动画阶段，不能重叠或超出场景时长。
- `supportingText`：补充说明，可省略。

`title`、`claim`、`supportingText` 和 caption 是脚本/合成层数据，不会自动出现在镜头画面里。旁白文案、caption 显示区间和未来配音 cue 必须使用同一 scene-relative 帧时间轴。浏览器镜头只保留视觉关系需要的短标签；不要在每个镜头重复画 episode 标题、镜头序号或完整字幕。

示例视觉类型（具体可用值由各 episode 的本地 schema 决定）：

- `title`：提出问题或建立概念。
- `spectrum`：组成、范围或连续变化。
- `scattering`：路径、扩散或过程。
- `connection`：节点、连接或网络关系。
- `comparison`：两个状态或两个量的比较。
- `tokens`：Transformer 的 token 输入和输出。
- `attention`：Self-Attention 的上下文连接。
- `parallel`：token 的矩阵化并行计算。
- `stack`：Attention、前馈网络和多层 block 堆叠。
- `summary`：把前面的关系收束为结论。

新增视觉类型时，在所属 episode 的 `episode.ts` 中更新本地 schema 和渲染映射，并在需要时更新本文件。

### Beat purpose

可用的 beat purpose 包括：`enter`、`establish`、`focus`、`process`、`compare`、`resolve`、`transition`。浏览器镜头通过 HyperFrames 的 `hf-seek` 时间驱动 HTML/CSS/JavaScript、SVG、Canvas 或 WebGL 状态；Remotion 负责镜头资产之上的字幕和转场。

## 精确工作流

```powershell
npm run create-episode -- my-topic
npm run prepare-episode-assets -- my-topic
npm run validate-episode -- my-topic
npm run preview-episode -- my-topic
npm run render-still-frame -- my-topic --frame 30
npm run render-episode -- my-topic
```

最终文件是 `renders/my-topic/final.mp4`。`validate` 失败时不能进入标准渲染流程。
