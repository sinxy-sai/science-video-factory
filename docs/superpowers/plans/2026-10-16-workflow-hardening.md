# Science Video Workflow Hardening Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with verification after each task.

**Goal:** Turn the science video factory into a reusable, enforceable episode workflow and remove the obsolete black-hole example.

**Architecture:** Add a shared ShotBrief schema and filesystem contract, generate that contract from `new-episode`, validate episode documents and implementation declarations, and prepare assets into a deterministic Remotion public namespace. Keep existing manifest rendering compatible while making workflow artifacts mandatory for new episodes.

**Tech Stack:** TypeScript, Zod, Node fs/path, Remotion, GSAP, HyperFrames package.

**Spec:** Confirmed workflow design in chat on 2026-10-16.

## Global Constraints

- Episode ids remain lowercase kebab-case.
- Standard output is `renders/<episode-id>/final.mp4`.
- New episodes must contain script, storyboard, ShotBriefs, HyperFrames, Manim, and generated asset directories.
- Validation must fail on missing or placeholder workflow artifacts.
- The obsolete `black-hole-light` episode and related renders/public assets are removed.

---

### Task 1: Add ShotBrief schema and workflow helpers

**Files:**
- Modify: `science-video-factory/content/schema.ts`
- Modify: `science-video-factory/scripts/episode-utils.ts`
- Create: `science-video-factory/content/shot-brief.ts`

- [x] Define Zod schemas for implementation kind, continuity, asset references, visual direction, motion, quality checks, and ShotBrief.
- [x] Load `shot-briefs/*.json` in numeric order during workflow validation.
- [x] Add workflow path and placeholder checks.
- [x] Run `npm run typecheck`.

### Task 2: Replace episode scaffolding

**Files:**
- Modify: `science-video-factory/scripts/new-episode.ts`
- Create: `science-video-factory/scripts/test-new-episode-workflow.ts`
- Modify: `science-video-factory/package.json`

- [x] Generate script, storyboard, shot-briefs, hyperframes, manim, and assets/generated directories.
- [x] Generate a first ShotBrief and real HyperFrames shot workspace matching the placeholder manifest scene.
- [x] Add `prepare-assets` script entry.
- [x] Test generated tree and cleanup in a temporary episode.

### Task 3: Implement deterministic asset preparation

**Files:**
- Create: `science-video-factory/scripts/prepare-assets.ts`
- Modify: `science-video-factory/scripts/episode-utils.ts`
- Modify: `science-video-factory/README.md`

- [x] Copy generated, HyperFrames, Manim, and rendered shot outputs into `public/episodes/<id>/...`.
- [x] Write `assets.manifest.json` with source and destination paths.
- [x] Remove stale destination files before copying.
- [x] Run the command against a generated episode.

### Task 4: Enforce workflow validation

**Files:**
- Modify: `science-video-factory/scripts/validate.ts`
- Modify: `science-video-factory/scripts/validate-all.ts`
- Create: `science-video-factory/scripts/workflow-validation.ts`
- Modify: `science-video-factory/scripts/test-storyboard.ts`

- [x] Validate script/storyboard presence and non-placeholder content.
- [x] Validate ShotBrief schema, manifest id alignment, durations, implementation files, continuity chain, style pack, renderer, and caption coverage.
- [x] Produce actionable errors with episode and shot ids.
- [x] Run validation on generated fixtures; malformed and placeholder fixtures fail.

### Task 5: Pin local dependencies and standardize output

**Files:**
- Modify: `science-video-factory/package.json`
- Modify: `science-video-factory/scripts/render.ts`
- Modify: `science-video-factory/README.md`

- [x] Add pinned `gsap` and HyperFrames package dependencies.
- [x] Generated HyperFrames shots use local GSAP assets; removed example assets contain no CDN path.
- [x] Render to `renders/<id>/final.mp4` and snapshot metadata beside it.
- [x] Document old outputs as removed from the standard contract.

### Task 6: Remove obsolete black-hole example and verify repository

**Files:**
- Delete: `science-video-factory/content/episodes/black-hole-light/`
- Delete: `science-video-factory/renders/black-hole-light/`
- Delete: `science-video-factory/public/black-hole-light/`
- Delete: `science-video-factory/.remotion/black-hole-light.props.json`
- Modify: `science-video-factory/content/episodes/registry.generated.ts`

- [x] Delete the example and regenerate registry.
- [x] Run `npm run typecheck`.
- [x] Run `npm run validate-all`.
- [x] Run workflow fixture checks and the full test suite.

### Task 7: Official renderer default and visual quality closure

**Files:**
- Create: `science-video-factory/styles/vermilion-editorial/`
- Create: `science-video-factory/scripts/author-shots.ts`
- Create: `science-video-factory/scripts/preview-shots.ts`
- Create: `science-video-factory/scripts/render-shots.ts`
- Create: `science-video-factory/scripts/verify-output.ts`

- [x] Add a reusable Style Pack derived from the approved kinetic title card direction.
- [x] Add episode-level author, preview, shot-render, and final-output verification commands.
- [x] Route the default renderer through official HyperFrames `check` and delivery render.
- [x] Document the complete default path and keep `remotion-native` as an explicit exception.
