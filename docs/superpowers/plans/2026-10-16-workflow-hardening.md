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

- [ ] Define Zod schemas for implementation kind, continuity, asset references, and ShotBrief.
- [ ] Export typed loaders that read `shot-briefs/*.json` in numeric order.
- [ ] Add helpers for workflow paths and placeholder detection.
- [ ] Run `npm run typecheck`.

### Task 2: Replace episode scaffolding

**Files:**
- Modify: `science-video-factory/scripts/new-episode.ts`
- Create: `science-video-factory/scripts/test-new-episode-workflow.ts`
- Modify: `science-video-factory/package.json`

- [ ] Generate script, storyboard, shot-briefs, hyperframes, manim, and assets/generated directories.
- [ ] Generate a valid first ShotBrief matching the placeholder manifest scene.
- [ ] Add `prepare-assets` script entry.
- [ ] Test generated tree and cleanup in a temporary episode.

### Task 3: Implement deterministic asset preparation

**Files:**
- Create: `science-video-factory/scripts/prepare-assets.ts`
- Modify: `science-video-factory/scripts/episode-utils.ts`
- Modify: `science-video-factory/README.md`

- [ ] Copy generated, HyperFrames, and Manim outputs into `public/episodes/<id>/...`.
- [ ] Write `assets.manifest.json` with source and destination paths.
- [ ] Remove stale destination files before copying.
- [ ] Run the command against a generated episode.

### Task 4: Enforce workflow validation

**Files:**
- Modify: `science-video-factory/scripts/validate.ts`
- Modify: `science-video-factory/scripts/validate-all.ts`
- Create: `science-video-factory/scripts/workflow-validation.ts`
- Modify: `science-video-factory/scripts/test-storyboard.ts`

- [ ] Validate script/storyboard presence and non-placeholder content.
- [ ] Validate ShotBrief schema, manifest id alignment, durations, implementation files, continuity chain, and caption coverage.
- [ ] Produce actionable errors with episode and shot ids.
- [ ] Run validation on a generated fixture and ensure malformed fixtures fail.

### Task 5: Pin local dependencies and standardize output

**Files:**
- Modify: `science-video-factory/package.json`
- Modify: `science-video-factory/scripts/render.ts`
- Modify: `science-video-factory/README.md`

- [ ] Add pinned `gsap` and HyperFrames package dependencies using the project’s supported package names.
- [ ] Remove CDN usage from project-owned HTML/HyperFrames assets where present.
- [ ] Render to `renders/<id>/final.mp4` and snapshot metadata beside it.
- [ ] Document old outputs as removed from the standard contract.

### Task 6: Remove obsolete black-hole example and verify repository

**Files:**
- Delete: `science-video-factory/content/episodes/black-hole-light/`
- Delete: `science-video-factory/renders/black-hole-light/`
- Delete: `science-video-factory/public/black-hole-light/`
- Delete: `science-video-factory/.remotion/black-hole-light.props.json`
- Modify: `science-video-factory/content/episodes/registry.generated.ts`

- [ ] Delete the example and regenerate registry.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run validate-all`.
- [ ] Run the workflow fixture test and full test suite.
