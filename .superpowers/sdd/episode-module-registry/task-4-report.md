# Task 4 Report — Delegate scene rendering to EpisodeModule

## Status

Implemented and committed Task 4.

## Changed files

- `src/Root.tsx`: switched to `getEpisodeModule` from the generated registry, using `defaultEpisode.manifest` for composition metadata and default props; metadata resolution supports a serialized manifest or `episodeId` with dynamic duration, fps, width, and height.
- `src/compositions/ScienceVideo.tsx`: resolves the episode module from `manifest.id` and passes it through `SceneContent` to `SceneRenderer`, preserving sequence offsets, scene frames, scene count, and manifest-driven duration.
- `src/scenes/SceneRenderer.tsx`: accepts `{episode, scene}`, reads `useCurrentFrame()`, and delegates to `episode.renderScene({scene, frame})`; removed episode visual imports and visual-name switching.

## Verification

- `npm run typecheck`: passed (`tsc --noEmit` completed successfully).
- `npm run generate-registry`: passed (`tsx scripts/generate-registry.ts` completed successfully; no generated file changes were needed).
- `git diff --check`: passed (no whitespace errors).
- `npm run validate -- what-is-transformer`: failed before manifest validation because existing episode modules call Zod 4 `.extend()` on a refined schema. Runtime error: `Cannot overwrite keys on object schemas containing refinements. Use .safeExtend() instead.` The stack points to `content/episodes/how-memory-works/episode.ts:11`.

## Commit

- Commit message: `refactor: delegate scene rendering to episodes`
- Commit hash: `8c218087f53ad3cc110ebe33c16a33d870d88abf`

## Concerns

The requested validation command is currently blocked by the pre-existing Zod schema compatibility error in episode implementation files, which are outside Task 4's allowed modification scope. Core Task 4 typechecking, registry generation, and whitespace checks pass.
