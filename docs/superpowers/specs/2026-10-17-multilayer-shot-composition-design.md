# Multi-layer Shot Composition Design

## Goal

Allow one shot to combine browser-authored HTML/SVG/Canvas/Three.js visuals with Manim or other renderer layers, while keeping a single deterministic shot timeline and Remotion as the episode compositor.

## Contract

Existing single-renderer ShotBriefs remain valid. New layered ShotBriefs use `renderer: "composite"`, `implementation.composition: "layered"`, and an ordered `implementation.layers` array. Each layer declares its renderer, source files, entry point when required, z-index, alpha requirement, and an intermediate output contract. The final `implementation.output` remains the shot asset consumed by Remotion.

All layers share the shot width, height, fps, and duration. The validator rejects mismatches, missing bottoms, duplicate layer ids, unsupported alpha combinations, and missing source files.

## Render flow

```text
layer adapters render independently
  -> intermediate layer assets
  -> FFmpeg overlay in z-index order
  -> final renders/<episode>/shots/<shot>.mp4
  -> Remotion captions/transitions/final episode composition
```

Manim alpha layers render transparent PNG sequences. FFmpeg uses the browser or opaque layer as the base and overlays transparent sequences with `-shortest`, preserving the shared frame rate and dimensions.

## Scope

- Implement browser and Manim layers.
- Implement an FFmpeg composite adapter for MP4 final output.
- Keep Blender unsupported.
- Preserve existing single-layer browser and Manim behavior.
- Add schema, validation, command routing, unit tests, and documentation.
- Verify with a temporary mixed browser + Manim episode, then remove its source and generated outputs.
