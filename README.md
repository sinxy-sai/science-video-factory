# Science Video Factory

一个由 Remotion、React 和 TypeScript 驱动的科普视频生成模板。每条视频都是 `content/episodes/<id>/` 下的自包含模块：`script.md` 是完整旁白，`storyboard.md` 是分镜表，`shot-briefs/*.json` 是逐镜契约，`manifest.ts` 描述内容，`episode.ts` 校验本地视觉类型并渲染场景。

## 快速开始

```powershell
npm install
npm run new-episode -- my-topic
npm run prepare-assets -- my-topic
npm run validate-shots -- my-topic
npm run render-shots -- my-topic
npm run validate -- my-topic
npm run preview -- my-topic
npm run render -- my-topic
```

如果需要新建主题：

```powershell
npm run new-episode -- my-topic
```

删除指定视频项目：

```powershell
npm run delete-episode -- my-topic
```

该命令会删除 `content/episodes/<episode-id>/`、`renders/<episode-id>/` 和 `.remotion/<episode-id>.props.json`，然后重新生成 registry。只会清理这个 episode 对应的文件。

## 工作流

1. 将用户需求整理成知识结构，每个场景只承担一个主要关系。
2. 写完整 `script.md` 和 `storyboard.md`，再为每个场景写一个 `shot-briefs/shot-*.json`。
3. 默认使用 `hyperframes-default`：在 `hyperframes/<shot-id>/` 中完成 DESIGN.md 和 HTML composition。
4. 在 `manifest.ts` 中定义场景、时长、beats 和本地视觉类型。
5. 在 `episode.ts` 中使用 `z.enum([...])` 声明本 episode 的视觉 schema，并映射到 `scenes/` 组件。
6. 根据话题完成 `visual-style.md` 和每个 ShotBrief 的视觉方向，再运行 `npm run author-shots -- <episode-id>`。项目没有默认视觉风格；如需复用明确的外部 Style Pack，必须显式设置 `SCIENCE_VIDEO_STYLE`。
7. 运行 `npm run validate-shots -- <episode-id>`，调用 HyperFrames 官方 `check` 做 lint、runtime、layout、motion 和 WCAG 检查。
8. 用 `npm run preview-shots -- <episode-id> [shot-id]` 预览镜头。
9. 用 `npm run render-shots -- <episode-id>` 输出 HyperFrames 镜头素材。
10. 将 HyperFrames/Manim 产物放入对应目录，运行 `npm run prepare-assets -- <episode-id>`。
11. 运行 `npm run generate-registry` 更新静态 registry。
12. 运行 `npm run validate -- <episode-id>` 或 `npm run validate-all`。
13. 用 `npm run preview -- <episode-id>` 做动态节奏检查。
14. 用 `npm run still -- <episode-id> --frame 30` 检查单帧布局。
15. 用 `npm run render -- <episode-id>` 输出唯一标准文件 `renders/<episode-id>/final.mp4`。
16. 用 `npm run verify-output -- <episode-id>` 写入输出验证摘要。

字幕是当前分镜流程的一部分，按场景相对帧写入 manifest 并由 Remotion 渲染；配音仍是可选项，可以在不重写场景组件的情况下接入。场景进度条属于调试信息，不进入最终视频。

项目脚本会自动使用 `node_modules/.remotion/chrome-headless-shell/` 下的本地 Chrome Headless Shell。若该文件不存在，Remotion 会尝试自动下载浏览器。

## 目录

- `src/`：通用 Remotion 组件。
- `content/episodes/`：每条视频的 manifest、episode 模块、场景组件、素材和笔记。
- `content/episodes/registry.generated.ts`：由 `npm run generate-registry` 生成的静态模块 registry。
- `scripts/`：校验、预览、渲染和脚手架命令。
- `docs/`：工作流和组件约定。
- `.codex/skills/science-video-workflow/`：项目工作流 Skill。
