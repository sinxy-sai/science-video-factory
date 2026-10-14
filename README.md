# Science Video Factory

一个由 Remotion、React 和 TypeScript 驱动的科普视频生成模板。每条视频由 `content/episodes/<id>/manifest.ts` 描述，通用场景和图示组件位于 `src/`。

## 快速开始

```powershell
npm install
npm run validate -- why-sky-blue
npm run preview -- why-sky-blue
npm run still -- why-sky-blue --frame 30
npm run render -- why-sky-blue
```

如果需要新建主题：

```powershell
npm run new-episode -- how-memory-works
```

## 工作流

1. 将知识结构拆成每场景一个主要关系。
2. 在 episode 的 `manifest.ts` 中定义场景、时长和视觉类型。
3. 运行 `npm run validate -- <episode-id>`。
4. 用 `npm run studio -- <episode-id>` 预览。
5. 用 `npm run still -- <episode-id> --frame 30` 检查单帧布局。
6. 用 `npm run render -- <episode-id>` 输出 MP4。

当前示例不包含配音和字幕。后续音频字段可以在不重写场景组件的情况下加入 manifest。

项目脚本会自动使用 `node_modules/.remotion/chrome-headless-shell/` 下的本地 Chrome Headless Shell。若该文件不存在，Remotion 会尝试自动下载浏览器。

## 目录

- `src/`：通用 Remotion 组件和视觉实现。
- `content/episodes/`：每条视频的 manifest、素材和笔记。
- `scripts/`：校验、预览、渲染和脚手架命令。
- `docs/`：工作流和组件约定。
- `.codex/skills/science-video-workflow/`：项目工作流 Skill。
