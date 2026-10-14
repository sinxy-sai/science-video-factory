# Episode Module Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将科学视频工厂从手动中心注册表重构为 episode 自包含模块加自动生成静态 registry 的架构。

**Architecture:** 每个 episode 导出一个 `EpisodeModule`，包含经过公共和本地 schema 校验的 manifest 以及本 episode 的 `renderScene` 函数。生成脚本扫描 `content/episodes/*/episode.ts` 并写出静态 import 的 `registry.generated.ts`；Remotion 和命令行脚本只依赖这个 registry，不再导入具体视觉组件。

**Tech Stack:** TypeScript、React、Remotion 4、Zod、tsx、Node.js 文件系统 API。

**Spec:** `docs/superpowers/specs/2026-10-15-episode-module-registry-design.md`

## Global Constraints

- 保持现有 Remotion 4、React、TypeScript、Zod 依赖和现有视频输出规格。
- 不使用运行时 glob、运行时动态 import 或第三方插件下载；registry 必须使用静态 import。
- 公共 schema 只校验 manifest 结构；episode 自己校验 visual 名称和本地渲染映射。
- 现有 episode 的标题、场景顺序、时长、分辨率、帧率和视觉结果保持不变。
- 不加入配音、字幕、图片生成或视频生成模型。
- 每个任务完成后运行该任务列出的检查，并提交独立、可审查的 Git commit。

---

### Task 1: 建立公共 EpisodeModule 类型和加载接口

**Files:**
- Create: `content/episode-module.ts`
- Modify: `content/schema.ts`
- Modify: `scripts/episode-utils.ts`
- Test: `npm run typecheck`

**Interfaces:**
- Produces `EpisodeRenderSceneProps`, `EpisodeModule`、`loadEpisodeModule()` 和 `loadEpisodeManifest()`。
- `EpisodeModule.renderScene` 签名固定为 `(props: {scene: SceneManifest; frame: number}) => React.ReactNode`。

- [ ] **Step 1: 修改公共 scene schema**

把 `visualTypeSchema` 从固定 `z.enum([...])` 改为 `z.string().min(1)`，导出 `VisualType = string`，保留其余 scene 和 episode 字段校验不变。

- [ ] **Step 2: 创建公共模块类型**

在 `content/episode-module.ts` 中写入：

```ts
import type React from 'react';
import type {EpisodeManifest, SceneManifest} from './schema';

export type EpisodeRenderSceneProps = {
  scene: SceneManifest;
  frame: number;
};

export type EpisodeModule = {
  manifest: EpisodeManifest;
  renderScene: (props: EpisodeRenderSceneProps) => React.ReactNode;
};
```

- [ ] **Step 3: 增加模块加载函数**

在 `scripts/episode-utils.ts` 中从 `content/episodes/registry.generated.ts` 导入 `getEpisodeModule`，新增：

```ts
export async function loadEpisodeModule(id: string): Promise<EpisodeModule> {
  const safeId = assertEpisodeId(id);
  const module = getEpisodeModule(safeId);
  return module;
}

export async function loadEpisodeManifest(id: string): Promise<EpisodeManifest> {
  return (await loadEpisodeModule(id)).manifest;
}
```

在 registry 尚未生成时，暂时让 TypeScript 通过一个最小的占位 registry 文件；下一任务会用生成器覆盖它。

- [ ] **Step 4: 运行类型检查**

Run: `npm run typecheck`

Expected: 当前代码除 registry 接入变更外无新的 TypeScript 错误。

- [ ] **Step 5: Commit**

```bash
git add content/episode-module.ts content/schema.ts scripts/episode-utils.ts content/episodes/registry.generated.ts
git commit -m "refactor: add episode module contract"
```

### Task 2: 为每个现有 episode 创建自包含渲染模块

**Files:**
- Create: `content/episodes/why-sky-blue/episode.ts`
- Create: `content/episodes/why-sky-blue/scenes/SpectrumScene.tsx`
- Create: `content/episodes/why-sky-blue/scenes/ScatteringScene.tsx`
- Create: `content/episodes/how-memory-works/episode.ts`
- Create: `content/episodes/how-memory-works/scenes/ConnectionScene.tsx`
- Create: `content/episodes/what-is-transformer/episode.ts`
- Create: `content/episodes/what-is-transformer/scenes/TransformerScene.tsx`
- Create: `src/shared/visuals/ConclusionDiagram.tsx`
- Create: `src/shared/visuals/TitleCard.tsx`
- Create: `src/shared/theme/theme.ts`
- Modify: `content/episodes/*/manifest.ts`
- Delete: `src/visuals/SpectrumDiagram.tsx`
- Delete: `src/visuals/ScatteringDiagram.tsx`
- Delete: `src/visuals/ConnectionDiagram.tsx`
- Delete: `src/visuals/ConclusionDiagram.tsx`
- Delete: `src/visuals/TransformerDiagram.tsx`
- Test: `npm run typecheck`

**Interfaces:**
- Each `episode.ts` exports `episode: EpisodeModule`.
- Local visual unions are `skyVisualSchema`, `memoryVisualSchema`, and `transformerVisualSchema`.
- Shared `TitleCard` and `ConclusionDiagram` keep the current visual behavior.

- [ ] **Step 1: Move shared theme and shared visuals**

Copy `src/theme/theme.ts` to `src/shared/theme/theme.ts`, update shared component imports to the new path, and create `TitleCard.tsx` containing the current title visual. Keep `ConclusionDiagram.tsx` in shared because all three episodes use the summary visual.

- [ ] **Step 2: Move sky visuals into the sky episode**

Copy `SpectrumDiagram` into `content/episodes/why-sky-blue/scenes/SpectrumScene.tsx` and `ScatteringDiagram` into `content/episodes/why-sky-blue/scenes/ScatteringScene.tsx`. Preserve the `comparison` prop behavior in the local renderer.

- [ ] **Step 3: Move memory visual into the memory episode**

Copy `ConnectionDiagram` into `content/episodes/how-memory-works/scenes/ConnectionScene.tsx` and update its theme import.

- [ ] **Step 4: Move Transformer visual into the Transformer episode**

Copy `TransformerDiagram` into `content/episodes/what-is-transformer/scenes/TransformerScene.tsx` and update its theme import.

- [ ] **Step 5: Add local episode schemas and renderers**

Each `episode.ts` must parse its manifest with a local schema and render only its own visual union. The Transformer module must use local values `tokens`, `attention`, `parallel`, and `stack`, while its manifest is updated from `transformer-tokens`, `transformer-attention`, `transformer-parallel`, and `transformer-stack` to those local values.

Use this shape in every module:

```ts
const localManifestSchema = episodeManifestSchema.extend({
  scenes: z.array(sceneSchema.extend({visual: localVisualSchema})),
});

const validatedManifest = localManifestSchema.parse(manifest);

export const episode: EpisodeModule = {
  manifest: validatedManifest,
  renderScene: ({scene}) => {
    switch (scene.visual) {
      // local visual cases only
    }
  },
};
```

- [ ] **Step 6: Run type checking**

Run: `npm run typecheck`

Expected: all local renderers satisfy `EpisodeModule` and no import points to deleted `src/visuals` files.

- [ ] **Step 7: Commit**

```bash
git add content/episodes src/shared src/visuals content/schema.ts
git commit -m "refactor: make episodes own their visual modules"
```

### Task 3: Implement the static registry generator

**Files:**
- Create: `scripts/generate-registry.ts`
- Create: `content/episodes/registry.generated.ts`
- Delete: `content/episodes/index.ts`
- Modify: `package.json`
- Test: `npm run generate-registry`

**Interfaces:**
- Produces `episodeRegistry: Record<string, EpisodeModule>` and `getEpisodeModule(id: string): EpisodeModule`.
- `npm run generate-registry` is deterministic and exits nonzero for invalid episode folders.

- [ ] **Step 1: Write generator behavior**

Use `readdirSync`, `statSync`, `existsSync`, `writeFileSync`, and `resolve` to scan only directories under `content/episodes`. Reject directory names that fail the existing kebab-case pattern or lack `episode.ts`. Sort ids lexicographically before generating imports.

- [ ] **Step 2: Generate static imports**

The output must have this structure:

```ts
// GENERATED FILE. Run npm run generate-registry to update.
import type {EpisodeModule} from '../episode-module';
import {episode as howMemoryWorks} from './how-memory-works/episode';
import {episode as whatIsTransformer} from './what-is-transformer/episode';
import {episode as whySkyBlue} from './why-sky-blue/episode';

export const episodeRegistry: Record<string, EpisodeModule> = {
  [howMemoryWorks.manifest.id]: howMemoryWorks,
  [whatIsTransformer.manifest.id]: whatIsTransformer,
  [whySkyBlue.manifest.id]: whySkyBlue,
};

export function getEpisodeModule(id: string): EpisodeModule {
  const episode = episodeRegistry[id];
  if (!episode) {
    throw new Error(`Unknown episode "${id}". Available episodes: ${Object.keys(episodeRegistry).join(', ')}`);
  }
  return episode;
}
```

- [ ] **Step 3: Add npm command and generate the initial file**

Add `"generate-registry": "tsx scripts/generate-registry.ts"` to `package.json`, run `npm run generate-registry`, and verify that a second run produces no diff.

- [ ] **Step 4: Verify generator failure paths**

Run: `npm run generate-registry`

Expected: successful output listing the three episode ids and a stable generated file. The script must throw a clear error if an episode directory is missing `episode.ts`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-registry.ts content/episodes/registry.generated.ts content/episodes/index.ts package.json
git commit -m "refactor: generate static episode registry"
```

### Task 4: Replace the central scene switch with episode delegation

**Files:**
- Modify: `src/Root.tsx`
- Modify: `src/compositions/ScienceVideo.tsx`
- Modify: `src/scenes/SceneRenderer.tsx`
- Modify: `scripts/episode-utils.ts`
- Test: `npm run typecheck`

**Interfaces:**
- `SceneRenderer` accepts `{episode: EpisodeModule; scene: SceneManifest}` and delegates to `episode.renderScene({scene, frame})`.
- `ScienceVideo` resolves one episode module from `manifest.id` and passes it to every scene.

- [ ] **Step 1: Update Root to use episode modules**

Replace `getEpisodeManifest` with `getEpisodeModule`, use `defaultEpisode.manifest` for composition metadata, and keep `defaultProps={{manifest: defaultEpisode.manifest}}`.

- [ ] **Step 2: Update ScienceVideo and SceneContent**

Resolve `const episode = getEpisodeModule(manifest.id)` once in `ScienceVideo`, pass it through `SceneContent`, and keep the existing `Sequence`, `SceneFrame`, scene offsets, and manifest-driven duration unchanged.

- [ ] **Step 3: Simplify SceneRenderer**

Delete all visual imports and the global switch. The implementation should only call the episode module:

```tsx
export const SceneRenderer: React.FC<{episode: EpisodeModule; scene: SceneManifest}> = ({episode, scene}) => {
  const frame = useCurrentFrame();
  return <>{episode.renderScene({scene, frame})}</>;
};
```

- [ ] **Step 4: Run type checking**

Run: `npm run typecheck`

Expected: no central renderer imports any episode-specific visual component.

- [ ] **Step 5: Commit**

```bash
git add src/Root.tsx src/compositions/ScienceVideo.tsx src/scenes/SceneRenderer.tsx scripts/episode-utils.ts
git commit -m "refactor: delegate scene rendering to episodes"
```

### Task 5: Make CLI commands and new-episode use the registry

**Files:**
- Modify: `scripts/validate.ts`
- Create: `scripts/validate-all.ts`
- Modify: `scripts/preview.ts`
- Modify: `scripts/still.ts`
- Modify: `scripts/render.ts`
- Modify: `scripts/new-episode.ts`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/SCENE_GUIDE.md`
- Test: `npm test`

**Interfaces:**
- `validate-all.ts` iterates `Object.keys(episodeRegistry)` and validates each module.
- `new-episode.ts` creates a complete `manifest.ts`, `episode.ts`, and `scenes/IntroScene.tsx` scaffold, then runs registry generation.

- [ ] **Step 1: Update validation commands**

Keep `npm run validate -- <episode-id>` behavior, but load and validate the module from the registry. Add `validate-all` to validate every generated registry entry without hardcoded episode ids.

- [ ] **Step 2: Update preview, still, and render scripts**

Continue writing props files from `module.manifest`; all three scripts must resolve ids through `loadEpisodeModule` or the manifest wrapper and must not import `content/episodes/index.ts`.

- [ ] **Step 3: Upgrade new-episode scaffold**

Generate:

```text
content/episodes/<id>/manifest.ts
content/episodes/<id>/episode.ts
content/episodes/<id>/scenes/IntroScene.tsx
content/episodes/<id>/assets/.gitkeep
content/episodes/<id>/notes.md
```

The scaffold uses local visual value `intro`, parses it with `z.enum(['intro'])`, returns `<IntroScene />`, and invokes `npm run generate-registry` before printing the next commands.

- [ ] **Step 4: Update documentation**

Document the new directory contract, local visual schema, generated registry, and the exact workflow:

```powershell
npm run new-episode -- my-topic
npm run validate -- my-topic
npm run preview -- my-topic
npm run render -- my-topic
```

- [ ] **Step 5: Run all automated checks**

Run: `npm test`

Expected: registry generation, typecheck, and validation of every episode pass with no hardcoded episode list.

- [ ] **Step 6: Commit**

```bash
git add scripts package.json README.md docs/SCENE_GUIDE.md
git commit -m "refactor: route workflow commands through episode registry"
```

### Task 6: Verify visual and rendering compatibility

**Files:**
- Test: `npm test`
- Test: `npm run still -- what-is-transformer --frame 90`
- Test: `npm run still -- why-sky-blue --frame 90`
- Test: `npm run still -- how-memory-works --frame 90`
- Test: `npm run render -- what-is-transformer --scale 0.25`
- Test: `git diff --check`

**Interfaces:**
- No new interfaces; this task verifies the completed migration against the design acceptance criteria.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: typecheck, registry generation, and all episode validations pass.

- [ ] **Step 2: Render representative stills**

Run the three `still` commands above. Inspect each generated PNG and confirm the title/header/footer layout and episode-specific visual are present.

- [ ] **Step 3: Render a preview MP4**

Run: `npm run render -- what-is-transformer --scale 0.25`

Expected: a playable MP4 under `renders/what-is-transformer/` with the same duration and scene order as before.

- [ ] **Step 4: Check formatting and registry diff**

Run: `git diff --check` and `git status --short --branch`.

Expected: no whitespace errors and only intended generated files or render outputs are present.

- [ ] **Step 5: Commit final documentation or compatibility fixes**

```bash
git add .
git commit -m "test: verify modular episode workflow"
```

