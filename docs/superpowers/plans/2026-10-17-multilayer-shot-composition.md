# Multi-layer Shot Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic multi-layer shot rendering so browser and Manim visuals can occupy one shot and be composited with FFmpeg.

**Architecture:** Preserve single-layer ShotBriefs. Add a `composite` route whose layers render to intermediate assets, then use FFmpeg overlay in z-index order to produce the existing final shot asset. Remotion continues to consume only the final shot asset.

**Tech Stack:** TypeScript, Zod, HyperFrames, Manim 0.22, project-local FFmpeg/FFprobe, Remotion.

**Spec:** `docs/superpowers/specs/2026-10-17-multilayer-shot-composition-design.md`

## Global Constraints

- Use project-local `.venv` and `tools/ffmpeg/bin` executables.
- Existing single-layer browser and Manim episodes must continue to validate and render.
- Layer dimensions, fps, and duration must match the parent shot contract.
- Manim transparent layers use PNG sequences.
- Temporary mixed episode files are not committed.

---

### Task 1: Define layered ShotBrief contracts

**Files:**
- Modify: `production/shot-contract.ts`
- Modify: `content/shot-brief.ts`
- Test: `scripts/tests/test-shot-contract.ts`

- [x] Add `composite` renderer and `layered` composition literals.
- [x] Add layer schema with id, renderer, sourceRoot, optional entryPoint, output, visualMode, files, zIndex, and alpha.
- [x] Require layers for layered composition and preserve the current fields for asset composition.
- [x] Add tests for a valid browser + transparent Manim layered brief and rejection of mismatched layer dimensions.

### Task 2: Add renderer validation and layer routing

**Files:**
- Modify: `production/renderers.ts`
- Modify: `scripts/lib/episode-workflow-validation.ts`
- Modify: `scripts/commands/validate-episode-shots.ts`
- Test: `scripts/tests/test-multilayer-routing.ts`

- [x] Validate each layer using its renderer adapter and resolve source files relative to the episode root.
- [x] Add composite validation for layer ids, ordering, dimensions, fps, alpha, and required bottom layer.
- [x] Route composite validation through all layer adapters without rendering yet.
- [x] Add tests proving the composite route discovers both browser and Manim layers.

### Task 3: Render transparent Manim layers

**Files:**
- Modify: `production/renderers.ts`
- Test: `scripts/tests/test-manim-adapter.ts`

- [x] Add a layer render context and transparent PNG-sequence options to the Manim adapter.
- [x] Keep existing opaque MP4 rendering unchanged.
- [x] Ensure the layer output directory is created and reported deterministically.
- [x] Add a test for the transparent command arguments.

### Task 4: Implement FFmpeg layer compositor

**Files:**
- Create: `production/layer-compositor.ts`
- Modify: `scripts/commands/render-episode-shots.ts`
- Modify: `scripts/lib/episode-runtime.ts`
- Test: `scripts/tests/test-layer-compositor.ts`

- [x] Build an FFmpeg filter graph that uses the bottom layer as input and overlays higher z-index layers.
- [x] Support MP4/video and numbered PNG-sequence inputs.
- [x] Use project-local FFmpeg and output the parent shot contract path.
- [x] Add command construction tests and fail clearly when an intermediate layer is missing.

### Task 5: Document and verify mixed rendering

**Files:**
- Modify: `docs/WORKFLOW.md`
- Modify: `docs/SCENE_GUIDE.md`
- Modify: `docs/COMPONENT_GUIDE.md`
- Modify: `.codex/skills/science-video-workflow/SKILL.md`
- Create temporarily: `content/episodes/multilayer-fixture/`

- [x] Document layered ShotBriefs and transparent Manim overlays.
- [x] Create a temporary browser background plus Manim curve overlay episode.
- [x] Run planning validation, shot validation, rendering, asset preparation, episode validation, final render, and output verification.
- [x] Remove the temporary episode and all generated assets.

### Task 6: Full verification and commit

- [x] Run `npm test`, `npm run doctor`, and `npm run typecheck`.
- [x] Run `git diff --check` and confirm no temporary episode files remain.
- [ ] Commit only the workflow engine, tests, and documentation.
