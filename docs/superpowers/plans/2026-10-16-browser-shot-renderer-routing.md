# Browser Shot Renderer Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make every visual shot browser-authored and rendered through HyperFrames, while Remotion only handles episode timing, captions, transitions, and final composition.

**Architecture:** Add a `browser` shot adapter with `visualMode` metadata for HTML/CSS, SVG, Canvas 2D, and Three.js/WebGL. Shot sources live only under `content/episodes/<id>/html/<shot-id>/`; the adapter renders declared artifacts, asset preparation registers them, and Remotion consumes those assets for every scene.

**Tech Stack:** HTML, CSS, JavaScript, SVG, Canvas 2D, Three.js/WebGL, GSAP, HyperFrames, Remotion 4, React for the composition shell, TypeScript, Zod, Node.js filesystem/child-process APIs, and FFmpeg through HyperFrames/Remotion.

**Spec:** `docs/superpowers/specs/2026-10-16-renderer-routing-design.md`

## Global Constraints

- No `remotion-native` shot renderer.
- No legacy `hyperframes/<shot-id>/` source path.
- HTML/CSS, SVG, Canvas 2D, and Three.js/WebGL are visual modes inside the browser adapter.
- Remotion consumes rendered shot assets and does not draw shot visuals.
- HyperFrames must receive deterministic timelines; no wall-clock animation or unseeded randomness.
- FFmpeg is used for encoding and muxing, not for drawing.
- HTML/CSS/JavaScript, SVG, Canvas 2D, and Three.js/WebGL author the visual shot content.
- GSAP authors deterministic shot-level motion and timelines.
- HyperFrames drives, checks, previews, captures, and renders browser shots; it is not the visual authoring layer.
- A failed or missing shot artifact must fail asset preparation and final rendering.
- Existing source files are modified only after a focused failing test or validation case exists.

---

### Task 1: Define the browser shot and output contracts

**Files:**
- Create: `production/shot-contract.ts`
- Modify: `content/shot-brief.ts`
- Modify: `content/schema.ts`
- Test: `scripts/tests/test-shot-contract.ts`

**Interfaces:**
- `ShotRendererId = 'browser' | 'manim' | 'blender'`
- `VisualMode = 'html' | 'svg' | 'canvas' | 'webgl' | 'external'`
- `ShotOutputKind = 'mp4' | 'webm' | 'frame-sequence'`
- `ShotOutputContract = {kind, path, width, height, fps, alpha?}`
- `ShotImplementation = {sourceRoot, output, composition: 'asset', visualMode, files}`

- [x] **Step 1: Write failing schema tests**

Add cases proving that a browser brief accepts `sourceRoot: 'html/shot-001'`, `visualMode: 'svg'`, and an MP4 output, while `remotion-native`, `composition: 'native'`, missing output dimensions, and missing `sourceRoot` are rejected.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-contract.ts`

Expected: FAIL because the new schemas and types do not exist.

- [x] **Step 3: Implement the schemas and migration defaults**

Create Zod schemas in `production/shot-contract.ts`; update `content/shot-brief.ts` to import them, remove `remotion-native`, and require the browser implementation fields. Keep only explicit defaults that can be derived safely: `renderer: 'browser'`, `visualMode: 'html'`, `composition: 'asset'`, and output path `renders/<episode-id>/shots/<shot-id>.mp4` at the manifest's width/fps when the loader supplies episode context.

Add `shotAssetSchema` to `content/schema.ts` with `renderer`, `visualMode`, `kind`, `path`, `width`, `height`, `fps`, and `durationInFrames`, then add required `shotAsset` to each scene manifest once the loader is updated in Task 3.

- [x] **Step 4: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-contract.ts`

Expected: PASS for valid browser contracts and rejection cases.

- [x] **Step 5: Commit**

```bash
git add production/shot-contract.ts content/shot-brief.ts content/schema.ts scripts/tests/test-shot-contract.ts
git commit -m "feat: define browser shot output contracts"
```

### Task 2: Replace renderer placeholders with the browser adapter

**Files:**
- Modify: `production/renderers.ts`
- Modify: `scripts/lib/episode-workflow-validation.ts`
- Test: `scripts/tests/test-renderer-adapters.ts`

**Interfaces:**
- `RendererContext` includes `sourceRoot`, `output`, `width`, `height`, `fps`, and `durationInFrames`.
- `RendererAdapter.validate(context): string[]`
- `RendererAdapter.run(operation, context): number`
- `getRendererAdapter('browser' | 'manim' | 'blender')`

- [x] **Step 1: Write failing adapter tests**

Cover: browser source path must be `html/<shot-id>/index.html`; missing `data-composition-id`/timeline source must fail validation; browser render delegates to HyperFrames with the declared output; `manim` and `blender` return explicit unsupported diagnostics; `remotion-native` is rejected by schema and adapter lookup.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-renderer-adapters.ts`

Expected: FAIL because the adapter still exposes `hyperframes-default`, external placeholders, and `remotion-native`.

- [x] **Step 3: Implement the browser adapter**

Refactor `production/renderers.ts` so the browser adapter resolves only `content/episodes/<id>/html/<shot-id>/`, runs HyperFrames `check`, `preview`, and `render`, and passes the declared output path, dimensions, fps, and strict flags. Add deterministic source checks for the required composition element, GSAP/JavaScript timeline registration, and `visualMode` rules. Return exact diagnostics for unsupported external adapters.

Update `validateWorkflow()` to require `renderer: 'browser'` for browser shots, reject any `hyperframes/` source path, require implementation files under `html/`, and ensure every declared file exists.

- [x] **Step 4: Run the focused test**

Run: `npm exec tsx scripts/tests/test-renderer-adapters.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add production/renderers.ts scripts/lib/episode-workflow-validation.ts scripts/tests/test-renderer-adapters.ts
git commit -m "feat: add executable browser renderer adapter"
```

### Task 3: Route commands through declared source roots and outputs

**Files:**
- Modify: `scripts/commands/create-episode.ts`
- Modify: `scripts/commands/validate-episode-shots.ts`
- Modify: `scripts/commands/preview-episode-shots.ts`
- Modify: `scripts/commands/render-episode-shots.ts`
- Modify: `scripts/lib/episode-runtime.ts`
- Test: `scripts/tests/test-shot-command-routing.ts`

**Interfaces:**
- `getShotSourceDirectory(episodeId, brief): string`
- `getShotOutputPath(episodeId, brief): string`
- `getShotAssetPath(episodeId, brief): string`

- [x] **Step 1: Write failing command-routing tests**

Assert that generated episodes contain `html/shot-001/index.html`, ShotBrief files point to that source root, validation/preview/render resolve the same directory, and no command constructs `hyperframes/<shot-id>`.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-command-routing.ts`

Expected: FAIL because commands currently hardcode `hyperframes/<shot-id>`.

- [x] **Step 3: Implement shared path helpers**

Add path helpers to `scripts/lib/episode-runtime.ts`; use them from all shot commands. Update the episode scaffold to create `html/shot-001/DESIGN.md`, `index.html`, and local GSAP asset references. Set generated ShotBrief `renderer: 'browser'`, `visualMode: 'html'`, `composition: 'asset'`, source file `html/shot-001/index.html`, and an MP4 output contract.

- [x] **Step 4: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-command-routing.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add scripts/commands scripts/lib/episode-runtime.ts scripts/tests/test-shot-command-routing.ts
git commit -m "feat: route shot commands through browser sources"
```

### Task 4: Register rendered shot assets during preparation

**Files:**
- Modify: `scripts/commands/prepare-episode-assets.ts`
- Modify: `scripts/lib/episode-workflow-validation.ts`
- Create: `production/shot-assets.ts`
- Test: `scripts/tests/test-shot-assets.ts`

**Interfaces:**
- `ShotAssetRecord`
- `buildShotAssetManifest(episodeId, briefs): ShotAssetRecord[]`
- `readShotAssetManifest(episodeId): ShotAssetRecord[]`

- [x] **Step 1: Write failing asset-registry tests**

Assert that preparation fails when a declared output is absent, copies each output into `static/episodes/<id>/shots/`, and writes `shots/assets.manifest.json` with renderer, visual mode, dimensions, fps, duration, and relative path.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-assets.ts`

Expected: FAIL because preparation currently copies the whole HyperFrames tree and does not register output contracts.

- [x] **Step 3: Implement the asset registry**

Create `production/shot-assets.ts` for validating output metadata and serializing records. Change preparation to copy only declared browser sources and rendered outputs into `static/episodes/<id>/shots/`, then write the manifest after every output passes existence and metadata checks. Make missing outputs hard failures.

- [x] **Step 4: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-assets.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add scripts/commands/prepare-episode-assets.ts scripts/lib/episode-workflow-validation.ts production/shot-assets.ts scripts/tests/test-shot-assets.ts
git commit -m "feat: register rendered shot assets"
```

### Task 5: Make Remotion consume shot assets only

**Files:**
- Modify: `src/compositions/ScienceVideo.tsx`
- Modify: `src/scenes/SceneRenderer.tsx`
- Modify: `content/episode-module.ts`
- Modify: `src/components/SceneFrame.tsx`
- Create: `src/scenes/ShotAssetScene.tsx`
- Test: `scripts/tests/test-shot-composition.ts`

**Interfaces:**
- `ShotAssetScene({asset, scene}): React.ReactElement`
- `EpisodeModule.renderScene` is removed from the required visual path.
- `SceneContent` receives a `shotAsset` record and renders the asset before caption/transition layers.

- [x] **Step 1: Write failing composition tests**

Assert that a scene with a prepared MP4 asset renders an `OffthreadVideo`/equivalent asset layer, captions remain above it, and no episode scene is allowed to render arbitrary native visual JSX.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-composition.ts`

Expected: FAIL because `SceneRenderer` currently calls `episode.renderScene()`.

- [x] **Step 3: Implement asset-only scene routing**

Load the prepared asset manifest by episode id, resolve the scene's asset path, and render it with the correct duration and dimensions. Keep `CaptionLayer` and future transition layers in `SceneFrame`. Remove `renderScene` from `EpisodeModule` or make it metadata-only, and update generated episode modules accordingly. Fail loudly when an asset is missing.

- [x] **Step 4: Run the focused test**

Run: `npm exec tsx scripts/tests/test-shot-composition.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/compositions/ScienceVideo.tsx src/scenes/SceneRenderer.tsx src/scenes/ShotAssetScene.tsx src/components/SceneFrame.tsx content/episode-module.ts scripts/tests/test-shot-composition.ts
git commit -m "feat: compose episodes from rendered shot assets"
```

### Task 6: Add a browser-authored SVG fixture and update documentation

**Files:**
- Create: `content/episodes/renderer-routing-fixture/html/shot-001/index.html`
- Create: `content/episodes/renderer-routing-fixture/html/shot-001/DESIGN.md`
- Create: `content/episodes/renderer-routing-fixture/shot-briefs/shot-001.json`
- Create: `content/episodes/renderer-routing-fixture/manifest.ts`
- Create: `content/episodes/renderer-routing-fixture/episode.ts`
- Create: `content/episodes/renderer-routing-fixture/script.md`
- Create: `content/episodes/renderer-routing-fixture/storyboard.md`
- Create: `content/episodes/renderer-routing-fixture/visual-style.md`
- Modify: `docs/WORKFLOW.md`
- Modify: `docs/SCENE_GUIDE.md`
- Modify: `docs/COMPONENT_GUIDE.md`
- Test: `scripts/tests/test-browser-fixture.ts`

**Interfaces:**
- Fixture uses `renderer: 'browser'`, `visualMode: 'svg'`, and the new `html/<shot-id>/` source path.

- [x] **Step 1: Write the fixture validation test**

The test must assert that the fixture has a browser source, a `data-composition-id`, a registered timeline, no `hyperframes/` directory, and a valid ShotBrief.

- [x] **Step 2: Run the focused test**

Run: `npm exec tsx scripts/tests/test-browser-fixture.ts`

Expected: FAIL until the fixture exists.

- [x] **Step 3: Implement the fixture**

Create a deterministic SVG explanatory shot with a hero frame, labeled visual relationship, GSAP-driven motion, and at least two meaningful state changes. Keep the visual style local to `DESIGN.md`/`visual-style.md`; do not copy `classroom-replica.html` as episode content.

- [x] **Step 4: Update workflow docs**

Replace old `hyperframes/<shot-id>` source references with `html/<shot-id>`, document HyperFrames as the browser driver/checker/renderer, and state that Remotion consumes shot assets only.

- [x] **Step 5: Run the focused test**

Run: `npm exec tsx scripts/tests/test-browser-fixture.ts`

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add content/episodes/renderer-routing-fixture docs/WORKFLOW.md docs/SCENE_GUIDE.md docs/COMPONENT_GUIDE.md scripts/tests/test-browser-fixture.ts
git commit -m "feat: add browser-authored renderer fixture"
```

### Task 7: Run end-to-end validation and output verification

**Files:**
- Modify: `scripts/commands/verify-episode-output.ts` if it lacks shot asset checks
- Modify: `README.md`
- Test: existing project test suite and fixture commands

- [x] **Step 1: Run type and contract tests**

Run: `npm run typecheck` and all focused tests from Tasks 1–6.

Expected: PASS.

- [x] **Step 2: Validate and render the fixture shot**

Run:

```powershell
npm run validate-episode-shots -- renderer-routing-fixture
npm run render-episode-shots -- renderer-routing-fixture
npm run prepare-episode-assets -- renderer-routing-fixture
```

Expected: HyperFrames checks pass, `renders/renderer-routing-fixture/shots/shot-001.mp4` exists, and the static shot asset manifest is written.

- [x] **Step 3: Render the fixture episode**

Run:

```powershell
npm run validate-episode -- renderer-routing-fixture
npm run render-still-frame -- renderer-routing-fixture --frame 30
npm run render-episode -- renderer-routing-fixture
npm run verify-episode-output -- renderer-routing-fixture
```

Expected: Remotion composites the rendered shot and captions into `renders/renderer-routing-fixture/final.mp4`; output metadata verification passes.

- [x] **Step 4: Run the full repository checks**

Run: `npm test`

Expected: Existing workflow tests plus the new browser routing tests pass.

- [x] **Step 5: Update README and commit**

Document the new routing commands and source layout in `README.md`, then commit:

```bash
git add README.md scripts/commands/verify-episode-output.ts
git commit -m "docs: document browser-first video routing"
```

## Self-review checklist

- [x] Every spec goal has a task: contracts (1), adapter (2), command routing (3), asset registry (4), Remotion composition (5), fixture/docs (6), verification (7).
- [x] No task uses `remotion-native` or the legacy `hyperframes/` source path.
- [x] `browser` is the only visual shot adapter in the first implementation pass; Manim/Blender remain explicit unsupported adapters.
- [x] Output kinds and metadata are defined before asset preparation and composition tasks.
- [x] Every task has a focused test or command verification step.
- [x] No placeholder terms such as TBD or TODO are used in the implementation steps.
