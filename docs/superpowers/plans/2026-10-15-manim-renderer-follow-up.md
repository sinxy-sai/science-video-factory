# Manim Renderer Follow-up Plan

## Goal

Add an optional project-local Manim renderer for mathematical and geometric shots without making Manim part of the Remotion composition timeline.

## Proposed boundary

```text
Manim scene script
  ↓
transparent video or image sequence
  ↓
Remotion asset layer
  ↓
final composition with audio, captions, and episode timing
```

## Planned steps

1. Create `science-video-factory/.venv` with a supported Python version and install Manim only after dependency/network approval.
2. Add `renderBackend?: 'remotion' | 'manim'` to a scene-level schema only when a real episode needs it.
3. Add a small adapter that validates a generated Manim asset path and exposes its frame duration to Remotion.
4. Build one disposable vector or equation example and compare its visual quality and render cost against an SVG scene.
5. Keep Manim assets outside the Node dependency graph and document reproducible commands.
