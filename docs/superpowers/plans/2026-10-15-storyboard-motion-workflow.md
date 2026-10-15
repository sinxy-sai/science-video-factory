# Storyboard Motion Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make science-video-factory storyboard-driven so scenes have explicit animation beats, no rendered progress rail, and enough staged motion to avoid PPT-like output.

**Architecture:** Keep Remotion as the primary renderer. Add validated beat metadata to each scene, compute the active beat in the shared renderer, and pass that timing context into episode scene components. Migrate the Transformer episode to use the contract while keeping SVG visuals local to the episode.

**Tech Stack:** React, TypeScript, Remotion 4, Zod, SVG, CSS, Node scripts.

**Spec:** `science-video-factory/docs/superpowers/specs/2026-10-15-storyboard-motion-workflow-design.md`

## Global Constraints

- Remotion remains the only primary renderer.
- Beats use scene-relative integer frames and deterministic frame-derived animation.
- The final video must not render `ProgressRail`.
- Manim is a later optional asset renderer and is not mixed into the Remotion timeline in this phase.
- Captions are part of the storyboard contract in this phase; narration/audio remains optional.

---

### Task 1: Add the validated beat contract

**Files:**
- Modify: `content/schema.ts`
- Modify: `content/episode-module.ts`
- Create: `src/motion/scene-beats.ts`

**Interfaces:**
- `SceneBeat` is exported from `content/schema.ts`.
- `getActiveSceneBeat(scene, frame)` returns `{beat: SceneBeat | null, beatProgress: number}`.
- `EpisodeRenderSceneProps` includes `beat` and `beatProgress`.

- [x] Add `sceneBeatSchema` with stable id, purpose, start frame, and duration.
- [x] Extend `sceneSchema` with a required non-empty `beats` array.
- [x] Validate ordering, overlap, and scene-duration bounds in `episodeManifestSchema`.
- [x] Implement `getActiveSceneBeat` with clamped local progress.
- [x] Update the episode render prop type to expose the active beat context.

### Task 2: Route beat timing through the shared renderer

**Files:**
- Modify: `src/scenes/SceneRenderer.tsx`
- Modify: `src/compositions/ScienceVideo.tsx`
- Modify: `src/components/SceneFrame.tsx`
- Delete or stop using: `src/components/ProgressRail.tsx`

**Interfaces:**
- `SceneRenderer` computes beat timing from the scene-local Remotion frame.
- `episode.renderScene` receives `scene`, `frame`, `beat`, and `beatProgress`.

- [x] Compute active beat in `SceneRenderer` and pass it to `episode.renderScene`.
- [x] Remove `ProgressRail` from `SceneFrame` so it cannot enter final renders.
- [x] Keep the scene footer available for supporting copy without a progress UI.
- [x] Preserve scene-relative frame behavior created by `Sequence`.

### Task 3: Migrate the Transformer episode manifest to storyboards

**Files:**
- Modify: `content/episodes/what-is-transformer/manifest.ts`
- Modify: `content/episodes/what-is-transformer/episode.ts`
- Modify: `content/episodes/what-is-transformer/scenes/TransformerScene.tsx`

**Interfaces:**
- Every Transformer scene has beats that describe its visual rhythm.
- `TransformerScene` consumes `beat` and `beatProgress` and changes at least the process-heavy scenes across beats.

- [x] Add explicit beats to all 13 scenes using scene-relative frame ranges.
- [x] Update the episode render function to forward the beat context.
- [x] Refactor `TransformerScene` props to accept the active beat id and progress.
- [x] Make `tokens`, `attention`, `generation`, and `summary` show staged state changes instead of one global reveal.
- [x] Keep the remaining scenes deterministic and use beat progress for staggered entrance or emphasis.

### Task 4: Document the new operating workflow

**Files:**
- Modify: `README.md`
- Modify: `docs/WORKFLOW.md`
- Modify: `docs/SCENE_GUIDE.md`
- Modify: `.codex/skills/science-video-workflow/SKILL.md`

**Interfaces:**
- Documentation describes the required storyboard step and beat fields.
- Documentation states that progress rails are debug UI only and are not part of final output.

- [x] Replace the manifest-only workflow with topic → knowledge structure → storyboard → manifest → scene implementation → dynamic preview → render.
- [x] Add a beat table example to the scene guide.
- [x] Add review questions for visual relationship, state changes, and scene handoff.
- [x] Add the Manim boundary and future adapter note.

### Task 5: Verify the migration and record the next Manim step

**Files:**
- Modify: `package.json` only if a static verification script is needed.
- Create: `docs/superpowers/plans/2026-10-15-manim-renderer-follow-up.md`

- [x] Run `npm run typecheck` in `science-video-factory`.
- [x] Run `npm run validate -- what-is-transformer`.
- [x] Render representative stills for an early beat, a middle beat, and the final beat.
- [x] Inspect that the rendered frames contain no progress rail.
- [x] Write the follow-up plan for project-local Manim installation and a transparent asset adapter without installing it into the Remotion dependency graph.
