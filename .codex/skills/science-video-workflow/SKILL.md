---
name: science-video-workflow
description: Build reusable science explainer videos with manifest-driven Remotion scenes. Use for topic decomposition, visual explanation, episode scaffolding, SVG/CSS/Canvas visuals, preview, rendering, and output verification.
---

# Science Video Workflow

This project generates explanatory videos, not cinematic reels. Keep the reading path clear: one knowledge claim per scene, direct labels, short copy, and motion that explains a relationship.

## Skill routing

- Use `superpowers:brainstorming` before designing a new content flow or component behavior.
- Use `build-web-data-visualization:data-visualization` when choosing a chart, diagram, color encoding, annotation, or data story.
- Use `visualize:visualize` for an interactive concept prototype when the mechanism is easier to inspect visually. Rewrite the approved idea as a deterministic Remotion scene afterward.
- Use `remotion:remotion-markup` for React scene implementation.
- Use `remotion:remotion-studio` for preview and `remotion:remotion-render` for output.
- Use `remotion:remotion-docs` when an API or version detail is uncertain.
- Use `superpowers:verification-before-completion` before claiming a render, validation, or implementation is complete.

## Manifest-first workflow

1. Choose or create `content/episodes/<episode-id>/manifest.ts`.
2. Write a storyboard for each scene: one claim, one visual relationship, and explicit animation beats.
3. Keep each scene focused on one claim and one visual relationship.
4. Run `npm run validate -- <episode-id>`.
5. Preview with `npm run preview -- <episode-id>` and inspect the dynamic rhythm.
6. Check representative frames with `npm run still -- <episode-id> --frame 30`.
7. Render with `npm run render -- <episode-id>`.
8. Inspect the output and the manifest snapshot in `renders/<episode-id>/`.

The Remotion renderer receives the selected manifest through a serialized props file. Do not hardcode a new episode into a scene component.

## Renderer choices

- Prefer SVG for diagrams, arrows, labels, simple plots, and any visual with important text.
- Use CSS for layout, typography, and simple transitions.
- Use Canvas 2D for dense repeated marks, particles, or high-frequency redraw. Use frame-derived values; never use wall-clock time or unseeded randomness.
- Add Three.js, WebGL, or GLSL only when depth, scale, flow, or a shader is part of the explanation.
- Keep HyperFrames and GSAP as an independent optional branch. Do not put a second primary timeline in a Remotion composition.

## Layout and motion rules

- Build the static hero frame before adding motion.
- Keep primary content in a full-size safe container with padding and flex layout.
- Use `useCurrentFrame`, `interpolate`, and `spring` for deterministic animation.
- Keep text at readable video sizes and avoid long paragraphs.
- Do not rely on hover, audio, or interaction to reveal the core explanation.
- Give motion a job: introduce, emphasize, compare, show process, or show cause and effect.
- Do not render a progress rail or other debug UI into the final video.

## Future audio

Captions are part of the storyboard contract: add scene-relative caption cues to the manifest and render them with the caption layer. Audio and narration remain optional extensions; route them to `remotion-captions` or an approved narration workflow without making the no-audio renderer wait for an audio file.
