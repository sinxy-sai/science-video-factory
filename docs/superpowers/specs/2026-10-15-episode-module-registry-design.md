# Episode 模块化与自动 Registry 设计

## 背景

当前项目已经可以通过 manifest 驱动 Remotion 视频，但新增一个 episode 需要同时修改多个中心文件：`content/episodes/index.ts`、`content/schema.ts`、`src/scenes/SceneRenderer.tsx`，并把 episode 专属视觉组件放入共享的 `src/visuals/` 目录。

这种集中式结构适合早期验证，但会让 episode 之间产生不必要的耦合。目标是让每个 episode 自己拥有内容数据、视觉类型、场景组件和渲染入口，同时保留 Remotion 所需的静态、可分析的模块导入。

## 目标

- 新增 episode 时只需要新增一个 episode 目录和其模块文件。
- 核心渲染层不导入任何具体 episode 的视觉组件。
- `content/schema.ts` 不因新增 episode 的视觉类型而修改。
- episode 可以独立选择 SVG、Canvas 2D、Three.js 或其他实现方式。
- Remotion、TypeScript、IDE 和 CI 都能通过静态 import 稳定解析 episode。
- 保留统一的 manifest 公共字段校验和现有命令行工作流。

## 非目标

- 本次不引入运行时插件下载或第三方插件市场。
- 本次不把所有现有共享视觉组件重写成新的动画系统。
- 本次不加入配音、字幕、图片生成或视频生成模型。
- 本次不改变现有视频的默认分辨率、帧率或输出编码。

## 目录结构

每个 episode 使用自包含目录：

```text
content/episodes/<episode-id>/
├─ manifest.ts
├─ episode.ts
├─ scenes/
│  ├─ SceneA.tsx
│  └─ SceneB.tsx
├─ notes.md
└─ assets/
```

共享能力放在：

```text
src/shared/
├─ components/
├─ visuals/
├─ animation/
└─ theme/
```

`manifest.ts` 只描述 episode 元数据和场景顺序。`episode.ts` 导出该 episode 的模块对象，并负责 episode 本地视觉类型校验和场景渲染。episode 专属组件放在 episode 自己的 `scenes/` 下；只有跨 episode 复用的组件才进入 `src/shared/`。

## EpisodeModule 接口

核心层只依赖统一接口：

```ts
export type EpisodeModule = {
  manifest: EpisodeManifest;
  renderScene: (props: {
    scene: SceneManifest;
    frame: number;
  }) => React.ReactNode;
};
```

公共 `SceneManifest` 继续校验 `id`、`title`、`claim`、`durationInFrames` 等字段，但 `visual` 改为非空字符串。每个 episode 在自己的模块中定义更严格的视觉 schema，并在加载或构建时校验场景视觉名称。

核心渲染链路为：

```text
Root
  → registry.getEpisode(id)
  → EpisodeModule.manifest
  → SceneFrame
  → EpisodeModule.renderScene(scene)
```

核心层不再维护视觉类型 switch，也不再导入 episode 专属组件。

## 自动生成静态 Registry

新增 `scripts/generate-registry.ts`，扫描 `content/episodes/*/episode.ts`，按 episode id 排序并生成：

```text
content/episodes/registry.generated.ts
```

生成文件使用静态 import，并导出 episode registry 及 `getEpisodeModule()`。生成器规则如下：

- episode 目录名必须符合现有 kebab-case id 规则。
- 每个 episode 目录必须包含 `episode.ts`。
- 生成器发现缺少入口、重复 id 或无效目录名时退出并报错。
- 生成结果稳定排序，避免无意义的 diff。
- 生成文件提交到 Git，便于 Remotion、IDE 和 CI 直接解析。
- 文件头明确标记为自动生成，人工修改会在下一次生成时覆盖。

项目脚本调整为：

```text
npm run generate-registry
npm test
npm run preview -- <episode-id>
npm run render -- <episode-id>
```

`npm test` 首先运行 registry 生成，再运行 TypeScript 检查和所有 episode 的 manifest 校验。

## Episode 本地校验

每个 `episode.ts` 定义本地视觉类型 schema。例如 Transformer episode 只允许 `tokens`、`attention`、`parallel` 和 `stack`。模块加载时通过本地 schema 解析 manifest 场景，确保视觉名称和组件映射一致。

本地校验失败时，错误信息包含 episode id、场景 id 和无效 visual 值，方便定位。公共 schema 负责结构校验，本地 schema 负责 episode 语义校验。

## 兼容现有命令

以下命令保持不变：

- `npm run validate -- <episode-id>`
- `npm run preview -- <episode-id>`
- `npm run still -- <episode-id> --frame <n>`
- `npm run render -- <episode-id> [--scale <n>]`

命令内部统一从生成的 registry 获取 episode module，不再从手写中心索引导入 manifest。

## 迁移步骤

1. 定义公共 `EpisodeModule` 类型和 episode 加载接口。
2. 将三个现有 episode 各自迁移为 `episode.ts`。
3. 将 Transformer 专属视觉组件迁移到其 episode 目录；将真正可复用的视觉组件迁移到 `src/shared/`。
4. 实现 registry 生成脚本和生成文件。
5. 修改 Root、预览、抽帧、渲染和校验脚本使用 registry。
6. 删除旧的手写 `content/episodes/index.ts`、全局视觉枚举和核心 `SceneRenderer` switch。
7. 为新增 episode 命令补充入口模板和生成 registry 步骤。
8. 运行类型检查、manifest 校验、单帧渲染和视频渲染 smoke test。

## 验收标准

- 新增一个只包含 `manifest.ts`、`episode.ts` 和本地 scene 文件的 episode 后，不修改核心文件即可被 registry 发现。
- 修改一个 episode 的 visual 名称不会要求编辑公共 schema 或核心渲染器。
- `npm test` 能自动生成 registry，并通过所有现有 episode 的类型检查和 manifest 校验。
- 三个现有 episode 的视频画面和输出规格保持不变。
- `npm run still` 和 `npm run render` 能通过 episode id 正常工作。
- Git diff 中不再出现手动维护的 episode 注册 import 或全局 episode visual 枚举。

## 风险与处理

- **生成文件过期**：测试和 CI 在校验前重新生成；生成文件提交到 Git 便于审查。
- **本地 visual 映射错误**：episode 模块在加载时做本地 schema 校验，并报告具体 scene。
- **共享组件边界不清**：只有至少两个 episode 使用的组件才迁移到 `src/shared/`；单 episode 组件留在本地。
- **Remotion 打包路径问题**：registry 使用静态 import，不使用运行时 glob 或动态 import。
