---
name: science-video-workflow
description: Build reusable science explainer videos with browser-authored shots and manifest-driven Remotion composition. Use for topic decomposition, visual explanation, episode scaffolding, HTML/SVG/Canvas/WebGL visuals, preview, rendering, and output verification.
---

# Science Video Workflow

This project generates explanatory videos for real viewers. Keep the explanation clear, but allow cinematic staging, visual metaphor, camera movement, rhythm changes, and varied animation types when they improve understanding and attention.

## Required project guides

Before planning, creating, editing, validating, previewing, or rendering an episode, read these project guides from the repository root:

1. `docs/WORKFLOW.md` — episode lifecycle, commands, output paths, and renderer responsibilities.
2. `docs/SCENE_GUIDE.md` — episode structure, ShotBrief contract, continuity, and beat rules.
3. `docs/COMPONENT_GUIDE.md` — reusable component boundaries and visual implementation constraints.

Treat these guides as part of the workflow contract. If a guide conflicts with this skill, follow the higher-priority project or user instruction and update the guide or skill when the contract changes. Do not assume that the guides were read in an earlier turn.

## Skill routing

- Use `superpowers:brainstorming` before designing a new content flow or component behavior.
- Use `build-web-data-visualization:data-visualization` when choosing a chart, diagram, color encoding, annotation, or data story.
- Use `visualize:visualize` for an interactive concept prototype when the mechanism is easier to inspect visually. Rewrite the approved idea as a deterministic browser shot afterward.
- Use `remotion:remotion-markup` for episode-level composition layers only.
- Use `remotion:remotion-studio` for preview and `remotion:remotion-render` for output.
- Use `hyperframes:hyperframes` and `hyperframes:gsap` when a shot needs kinetic typography, complex path choreography, rich stagger, or HTML/CSS motion that would be awkward to author in a single React scene.
- Use Manim for mathematical, geometric, vector, matrix, and equation-driven shots; use Remotion as the final compositor.
- Use `remotion:remotion-docs` when an API or version detail is uncertain.
- Use `superpowers:verification-before-completion` before claiming a render, validation, or implementation is complete.

## Contract-first workflow

1. Run `npm run create-episode -- <episode-id>` to create the required workflow directories.
2. Write the complete narration in `script.md`.
3. Write `storyboard.md` with one claim, one visual relationship, explicit beats, and caption intent per shot.
4. Create one `shot-briefs/shot-*.json` for every manifest scene. Include continuity, renderer choice, implementation files, and assets.
5. Implement the browser shot in `html/<shot-id>/`, and keep `manifest.ts`/`episode.ts` as episode metadata and schema.
6. Run `npm run validate-episode-shots -- <episode-id>`. This invokes the browser adapter and HyperFrames `check` for lint, runtime, layout, motion, and WCAG contrast.
7. Use `npm run preview-episode-shots -- <episode-id> [shot-id]` and `npm run render-episode-shots -- <episode-id>` for shot preview and rendering.
8. Run `npm run prepare-episode-assets -- <episode-id>` and `npm run validate-episode -- <episode-id>`. Both shot and episode validation must pass before final render.
9. Preview with `npm run preview-episode -- <episode-id>` and inspect the dynamic rhythm.
10. Check representative frames with `npm run render-still-frame -- <episode-id> --frame 30`.
11. Render with `npm run render-episode -- <episode-id>`; the standard output is `renders/<episode-id>/final.mp4`.
12. Run `npm run verify-episode-output -- <episode-id>` to record final output metadata.

The Remotion renderer receives the selected manifest through a serialized props file. Do not hardcode a new episode into a scene component.

`validate` also checks that every manifest scene has a ShotBrief, ShotBrief durations match the manifest, continuity inheritance is valid, declared implementation files exist, and captions cover at least 80% of the shot duration.

## Renderer choices

- Prefer SVG for diagrams, arrows, labels, simple plots, and any visual with important text.
- Use CSS for layout, typography, and simple transitions.
- Use Canvas 2D for dense repeated marks, particles, or high-frequency redraw. Use frame-derived values; never use wall-clock time or unseeded randomness.
- Add Three.js, WebGL, or GLSL only when depth, scale, flow, or a shader is part of the explanation.
- Keep Remotion as the final composition timeline. HyperFrames drives browser-authored shots; GSAP controls shot-level motion; Manim and Blender remain explicit future adapters.
- Choose the visual mode from the storyboard: HTML/CSS for layout, SVG for labeled vector relationships, Canvas 2D for dense redraw, and Three.js/WebGL for depth, lighting, shaders, or spatial motion.

### Text ownership

- `ShotBrief.title`, scene titles, and shot numbers are metadata only. Do not render them into browser-authored shots.
- Do not default to a PPT-like `title + subtitle + diagram` layout. Build the visual relationship first.
- Remotion owns narration captions. Browser shots may use only short relationship labels that are not a verbatim copy of caption text.
- The workflow has no default sound effects, music, or voiceover audio. Keep narration as text until an audio workflow is explicitly introduced, but reserve one shared scene-relative frame timeline for narration text, caption cues, and future voiceover cues. Never author independent subtitle and voiceover timings.

## Layout and motion rules

- Build the static hero frame before adding motion.
- Keep primary content in a full-size safe container with padding and flex layout.
- Use `useCurrentFrame`, `interpolate`, and `spring` for deterministic animation.
- Keep text at readable video sizes and avoid long paragraphs.
- Do not rely on hover, audio, or interaction to reveal the core explanation.
- Give motion a job: introduce, emphasize, compare, show process, or show cause and effect.
- Vary motion types across a sequence: camera move, object transformation, path tracing, stagger, morph, scale reveal, particle flow, and visual metaphor. Do not reuse one entrance pattern for every shot.
- Do not render a progress rail or other debug UI into the final video.

## Future audio

Captions are part of the storyboard contract: add scene-relative caption cues to the manifest and render them with the caption layer. Narration currently means the text script/metadata only; future voiceover cues must reuse the caption timing. Do not generate voiceover audio, sound effects, or music unless the episode explicitly opts into an audio workflow.
