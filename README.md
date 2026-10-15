# Science Video Factory

一个由 Remotion、React 和 TypeScript 驱动的科普视频生成模板。每条视频都是 `content/episodes/<id>/` 下的自包含模块：`manifest.ts` 描述内容，`episode.ts` 校验本地视觉类型并渲染场景。

## 快速开始

```powershell
npm install
npm run new-episode -- my-topic
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
2. 为每个场景写分镜：进入、建立关系、过程、强调、收束和转场 beats。
3. 在 episode 的 `manifest.ts` 中定义场景、时长、beats 和本地视觉类型。
4. 在 `episode.ts` 中使用 `z.enum([...])` 声明本 episode 的视觉 schema，并映射到 `scenes/` 组件。
5. 运行 `npm run generate-registry` 更新静态 registry。
6. 运行 `npm run validate -- <episode-id>` 或 `npm run validate-all`。
7. 用 `npm run preview -- <episode-id>` 做动态节奏检查。
8. 用 `npm run still -- <episode-id> --frame 30` 检查单帧布局。
9. 用 `npm run render -- <episode-id>` 输出 MP4。

字幕是当前分镜流程的一部分，按场景相对帧写入 manifest 并由 Remotion 渲染；配音仍是可选项，可以在不重写场景组件的情况下接入。场景进度条属于调试信息，不进入最终视频。

项目脚本会自动使用 `node_modules/.remotion/chrome-headless-shell/` 下的本地 Chrome Headless Shell。若该文件不存在，Remotion 会尝试自动下载浏览器。

## 目录

- `src/`：通用 Remotion 组件。
- `content/episodes/`：每条视频的 manifest、episode 模块、场景组件、素材和笔记。
- `content/episodes/registry.generated.ts`：由 `npm run generate-registry` 生成的静态模块 registry。
- `scripts/`：校验、预览、渲染和脚手架命令。
- `docs/`：工作流和组件约定。
- `.codex/skills/science-video-workflow/`：项目工作流 Skill。
