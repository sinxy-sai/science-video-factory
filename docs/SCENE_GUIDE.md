# 场景指南

每个 episode 是自包含模块，目录至少包含 `content-plan.md`、`shot-design.md`、`script.md`、`storyboard.md`、`visual-style.md`、`shot-briefs/`、`manifest.ts`、`episode.ts`、`assets/generated/`、`html/` 和 `manim/`。`scenes/` 只作为脚手架遗留目录，不是镜头画面的必需来源。浏览器镜头使用 `html/<shot-id>/index.html`，可以组合 HTML/CSS/JavaScript、SVG、Canvas 2D 或 Three.js/WebGL，并用 GSAP 编排确定性动画；数学、几何、向量和公式镜头使用 `manim/<shot-id>/*.py`，并在 ShotBrief 中声明 `implementation.entryPoint`。HyperFrames 检查、预览并渲染浏览器镜头，Manim 使用项目 `.venv` 渲染数学镜头，分层镜头由各层 renderer 渲染后交给 FFmpeg 叠加，Remotion 只合成已准备的镜头资产、字幕和转场。生成的 `content/episodes/registry.generated.ts` 通过静态 import 收集所有 episode，命令行和 Remotion 都从这个 registry 加载模块。

### ShotBrief 契约

每个 manifest scene 必须对应一个 `shot-briefs/shot-*.json`。ShotBrief 至少描述：

- `sceneId`、`title`、`narration`、`visual`、`durationInFrames`
- `continuity.inherits` 和 `continuity.leaves`
- `renderer`、`implementation.sourceRoot`、`implementation.files`
- `implementation.visualMode`、`implementation.composition` 和 `implementation.output`
- layered 镜头还要声明 `implementation.layers`；每层有独立 renderer、源文件、`zIndex`、alpha 和中间输出
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

`visual` 的可用值由每个 episode 在 `episode.ts` 中的本地 Zod schema 定义。它是内容分类和校验字段，不会自动选择或绘制一个 Remotion 场景组件。新增视觉类型时，只需更新所属 episode 的本地 schema、分镜文档和对应 ShotBrief；只有共享契约发生变化时才更新本文件。

### Beat purpose

可用的 beat purpose 包括：`enter`、`establish`、`focus`、`process`、`compare`、`resolve`、`transition`。浏览器镜头通过 HyperFrames 的 `hf-seek` 时间驱动 HTML/CSS/JavaScript、SVG、Canvas 或 WebGL 状态；Manim 镜头由场景类的确定性动画时间线驱动；layered 镜头让这些 renderer 在同一 shot 时间线上分别生成图层，再由 FFmpeg 叠加；Remotion 负责镜头资产之上的字幕和转场。

## 精确工作流

```powershell
npm run create-episode -- my-topic
npm run validate-episode-planning -- my-topic
npm run author-episode-shots -- my-topic
npm run validate-episode-shots -- my-topic
npm run preview-episode-shots -- my-topic
npm run render-episode-shots -- my-topic
npm run prepare-episode-assets -- my-topic
npm run validate-episode -- my-topic
npm run preview-episode -- my-topic
npm run render-still-frame -- my-topic --frame 30
npm run render-episode -- my-topic
npm run verify-episode-output -- my-topic
```

最终文件是 `renders/my-topic/final.mp4`。`validate` 失败时不能进入标准渲染流程。
