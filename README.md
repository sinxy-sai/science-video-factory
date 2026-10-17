# Science Video Factory

Science Video Factory 是一个基于清单生成科普视频的开源工作流。镜头可以使用 HTML/CSS/JavaScript、SVG、Canvas 2D、Three.js/WebGL 或 Manim 绘制，并用 GSAP 编排浏览器镜头动画；同一个镜头可以把浏览器图层与 Manim 数学图层组合起来。HyperFrames 驱动浏览器镜头的检查、预览和渲染；Manim 使用项目本地 Python 环境；Remotion 负责总时间轴、字幕、转场和镜头资产合成；FFmpeg 负责图层合成、编码和封装。

每条视频都是 `content/episodes/<id>/` 下的自包含模块：`script.md` 是完整旁白，`storyboard.md` 是分镜表，`shot-briefs/*.json` 是逐镜契约，`html/<shot-id>/index.html` 是镜头画面源文件，`manifest.ts` 描述内容。

## 快速开始

```powershell
npm install
npm run doctor
npm run check-agent-harness
npm run create-episode -- my-topic
npm run validate-episode-planning -- my-topic
npm run author-episode-shots -- my-topic
npm run validate-episode-shots -- my-topic
npm run preview-episode-shots -- my-topic
npm run render-episode-shots -- my-topic
npm run prepare-episode-assets -- my-topic
npm run validate-episode -- my-topic
npm run preview-episode -- my-topic
npm run render-episode -- my-topic
npm run verify-episode-output -- my-topic
```

依赖诊断与安装：

```powershell
npm run doctor
npm run setup:python
```

工作流优先使用项目 `.venv` 中的 Python/Manim，以及 `tools/ffmpeg/bin` 中的 FFmpeg/FFprobe，不要求系统 PATH 已配置这些工具。

工作流 skill 的规范源是 `skills/science-video-workflow/SKILL.md`，并同步到三个 harness 的项目发现目录：`.agents/skills/science-video-workflow/SKILL.md`、`.claude/skills/science-video-workflow/SKILL.md` 和 `.codex/skills/science-video-workflow/SKILL.md`。四份文件必须保持完全一致；修改规范源后运行 `npm run sync-agent-harness-skill`，提交前运行 `npm run check-agent-harness` 检查内容哈希和项目 guide 引用。`.codex` 不是独立规则来源，也不会被删除。

如果需要新建主题：

```powershell
npm run create-episode -- my-topic
```

删除指定视频项目：

```powershell
npm run remove-episode -- my-topic
```

该命令会删除 `content/episodes/<episode-id>/`、`renders/<episode-id>/`、`static/episodes/<episode-id>/`、`.remotion/<episode-id>.props.json` 和对应的 `styles/<episode-id>/`（如果存在），然后重新生成 registry。只会清理这个 episode 对应的文件；共享的 `node_modules/`、项目依赖和工具不会被删除。

## 工作流

1. 接收用户想法后先进入讨论阶段，确认观众、学习目标、事实边界、时长、节奏、风格和音频策略；未完成批准不能开始写 renderer source。
2. 写完整 `content-plan.md` 和 `shot-design.md`，并且 front matter 必须声明讨论、内容、分镜和制作批准。
3. 再写 `script.md`、`storyboard.md` 和每个场景的 `shot-briefs/shot-*.json`。
4. 默认使用 `browser`：在 `html/<shot-id>/` 中完成 DESIGN.md 和 HTML composition。
5. 在 `manifest.ts` 中定义场景、时长、beats 和本地视觉类型。
6. 在 `episode.ts` 中使用 `z.enum([...])` 声明本 episode 的视觉 schema；镜头画面由 ShotBrief 声明的 HTML/Manim/分层实现提供。
7. 运行 `npm run validate-episode-planning -- <episode-id>`，检查计划内容、状态和批准。
8. 根据话题完成 `visual-style.md` 和每个 ShotBrief 的视觉方向，再运行 `npm run author-episode-shots -- <episode-id>`。当前版本使用 episode 自己的视觉语言。
9. 运行 `npm run validate-episode-shots -- <episode-id>`，按 ShotBrief 路由检查 browser、Manim 或 composite 图层；Blender 在没有执行器时明确失败。
10. 用 `npm run preview-episode-shots -- <episode-id> [shot-id]` 预览镜头。
11. 用 `npm run render-episode-shots -- <episode-id>` 输出各镜头声明的素材格式。
12. 运行 `npm run prepare-episode-assets -- <episode-id>`，校验并登记每个 ShotBrief 声明的镜头输出。
13. 运行 `npm run generate-episode-registry` 更新静态 registry。
14. 运行 `npm run validate-episode -- <episode-id>` 或 `npm run validate-all-episodes`。
15. 用 `npm run preview-episode -- <episode-id>` 做动态节奏检查。
16. 用 `npm run render-still-frame -- <episode-id> --frame 30` 检查单帧布局。
17. 用 `npm run render-episode -- <episode-id>` 输出唯一标准文件 `renders/<episode-id>/final.mp4`。
18. 用 `npm run generate-contact-sheet -- <episode-id>` 生成代表帧接触表。
19. 用 `npm run compare-episode-visual-regression -- <episode-id>` 对比 `renders/<episode-id>/baselines/` 中的基线帧。
20. 用 `npm run verify-episode-output -- <episode-id>` 写入输出验证摘要，并检查视频 metadata。

字幕是当前分镜流程的一部分，按场景相对帧写入 manifest 并由 Remotion 渲染。当前工作流不自动生成配音、音效或配乐；未来音频 cue 必须复用字幕的帧时间轴。场景进度条属于调试信息，不进入最终视频。

项目脚本会自动使用 `node_modules/.remotion/chrome-headless-shell/` 下的本地 Chrome Headless Shell。若该文件不存在，Remotion 会尝试自动下载浏览器。

## 目录

- `src/`：episode 级 Remotion 合成组件、字幕层和镜头资产承载组件。
- `content/episodes/`：每条视频的 manifest、ShotBrief、浏览器/Manim 镜头源文件、素材和笔记。
- `content/episodes/registry.generated.ts`：由 `npm run generate-episode-registry` 生成的静态模块 registry。
- `scripts/`：校验、预览、渲染和脚手架命令。
- `docs/`：工作流和组件约定。
- `skills/science-video-workflow/SKILL.md`：规范源；`.agents/`、`.claude/` 和 `.codex/` 下是同步后的 harness 入口。
