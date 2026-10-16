# Science Video Factory Renderer Routing Design

## Status

- State: design proposed
- Scope: replace placeholder renderer routing with an executable multi-backend shot pipeline
- First production route: browser-authored shots powered by HyperFrames, composed by Remotion

## Goals

1. Make HTML/CSS/SVG/Canvas/WebGL capable of being the source of truth for a shot.
2. Keep Remotion as the episode timeline, caption, transition, and final composition layer.
3. Keep FFmpeg in the encoding and muxing role.
4. Allow a shot to declare its renderer and output contract in its ShotBrief.
5. Make rendered shot assets discoverable and reproducible through the existing episode asset workflow.
6. Make every shot's visual content come from the browser-authored route; Remotion does not draw shot visuals.

## Non-goals

- Do not replace Remotion as the final episode compositor.
- Do not keep `remotion-native` as a shot renderer.
- Do not introduce a second root timeline outside the episode manifest.
- Do not implement Blender or Manim execution in this first routing pass.
- Do not redesign narration, caption authoring, or prompt generation.
- Do not use `classroom-replica.html` as episode content; use an equivalent HTML/SVG shot as a routing fixture.

## Technology stack and responsibilities

| Layer | Technologies | Responsibility |
|---|---|---|
| Visual authoring | HTML, CSS, JavaScript | Layout, typography, gradients, cards, UI-like compositions, DOM state |
| Vector graphics | SVG | Diagrams, paths, arrows, labels, icons, precise illustrated elements |
| Dense 2D rendering | Canvas 2D | Particles, repeated marks, procedural textures, high-frequency redraw |
| 3D and shader rendering | Three.js, WebGL, GLSL | 3D scenes, camera motion, depth, lighting, shaders, flow fields |
| Shot animation | GSAP | Deterministic timelines, easing, stagger, transforms, path choreography |
| Browser shot pipeline | HyperFrames | Load browser compositions, drive timelines, lint, inspect, preview, capture, render |
| Episode composition | Remotion | Episode timeline, scene ordering, captions, transitions, asset compositing, final render |
| Encoding and muxing | FFmpeg | Video encoding, audio/video muxing, format conversion, final packaging |

HyperFrames is the browser shot pipeline, not a replacement for HTML/CSS/JS, SVG, Canvas 2D, Three.js/WebGL, or GSAP. Those technologies author the visuals and motion inside each browser shot.

## Recommended architecture

### Layers

1. **Shot source layer**
   - HTML/CSS/JavaScript source for browser-authored shots.
   - SVG, Canvas 2D, and Three.js/WebGL visual layers embedded in those browser shots.
   - Browser source files for every visual shot.
   - Future external source folders for Manim, Blender, or Python-generated assets.

2. **Shot renderer layer**
   - A renderer adapter validates source files, checks the renderer-specific contract, previews, and renders a shot artifact.
   - The executable browser adapter is powered by HyperFrames. It opens the shot's HTML page in the bundled browser, drives its GSAP/JavaScript timeline, and renders the result.
   - HTML/CSS/JavaScript, SVG, Canvas 2D, and Three.js/WebGL are visual modes inside that browser adapter. They are not separate video encoders.
   - Remotion has no shot renderer. It only consumes rendered shot assets and adds episode-level composition layers.

3. **Asset preparation layer**
   - Copies source and rendered shot artifacts into `static/episodes/<episode-id>/shots/`.
   - Writes a machine-readable asset manifest containing renderer, output kind, dimensions, fps, duration, and source paths.

4. **Episode composition layer**
   - Reads the prepared asset manifest and selects the rendered shot asset for each scene.
   - Keeps captions and episode-level transitions in Remotion.

5. **Encoding layer**
   - HyperFrames and Remotion may invoke FFmpeg internally for their supported outputs.
   - The project does not use FFmpeg as a drawing API.

## Renderer protocol

Introduce a renderer contract with these operations:

```ts
type ShotRenderOperation = 'validate' | 'preview' | 'render';

type ShotOutputKind = 'mp4' | 'webm' | 'frame-sequence';

type ShotRendererId = 'browser' | 'manim' | 'blender';
```

Each adapter receives the episode id, ShotBrief, source directory, output path, and the episode's media contract. It returns structured diagnostics and a process status. Validation must fail before rendering when a declared source, output kind, dimension, or duration contract is missing.

### Browser adapter

- Source: `html/<shot-id>/index.html`.
- Required source contract: `data-composition-id`, width, height, duration, registered `window.__timelines`, and deterministic timeline construction.
- Preview: HyperFrames preview.
- Validation: HyperFrames lint, validate, inspect, and optional animation map.
- Render: HyperFrames render to the declared output kind.
- `visualMode` identifies whether the browser page uses HTML/CSS/JavaScript, SVG, Canvas 2D, or Three.js/WebGL.
- Canvas and WebGL animation must derive from the captured timeline frame and must not use wall-clock state or unseeded randomness.

### External adapters

Manim and Blender remain explicit adapter ids with clear “not configured” diagnostics until their executable contracts are implemented. They must not silently fall back to Remotion or HTML.

## Manifest and ShotBrief changes

Extend the shot implementation contract with:

- `sourceRoot`: renderer-relative source directory.
- `output`: `{kind, path, width, height, fps, alpha?}`.
- `composition`: `'asset'`.
- `visualMode`: `'html' | 'svg' | 'canvas' | 'webgl' | 'external'`.

The existing `renderer` field remains the selected adapter id. Existing HyperFrames briefs are migrated by defaulting `sourceRoot` to `hyperframes/<shot-id>` and output to an MP4 under `renders/<episode-id>/shots/`.

The episode manifest gains a per-scene `shotAsset` reference populated during asset preparation.

## Data flow

```text
ShotBrief + source files
        |
        v
renderer adapter validate
        |
        v
renderer adapter preview/render
        |
        v
renders/<episode>/shots/<shot>.{mp4|webm|frames}
        |
        v
prepare-episode-assets
        |
        v
static/episodes/<episode>/shots/assets.manifest.json
        |
        v
Remotion scene router
  └─ rendered shot asset
        |
        v
captions + episode transitions + final MP4
```

## Source layout

New episodes should use:

```text
content/episodes/<id>/
  html/<shot-id>/index.html
  html/<shot-id>/DESIGN.md
  scenes/
  shot-briefs/
  manifest.ts
  episode.ts
```

The generated episode scaffold uses `html/<shot-id>/` for every browser-authored shot. There is no legacy `hyperframes/<shot-id>/` source path.

## Error handling

- Missing source files, invalid renderer ids, mismatched dimensions, missing timeline registration, and missing output artifacts are hard errors.
- Unsupported external adapters report the exact missing executable contract and stop that shot.
- A failed shot must prevent asset preparation from claiming success.
- Asset manifests are written only after all declared shot outputs are present.
- The final episode renderer must fail if a scene declares an asset shot but its prepared asset is absent.

## Verification strategy

1. Unit-test renderer schema parsing and default migration behavior.
2. Unit-test adapter validation for missing source, invalid output contract, and successful HTML source.
3. Add a deterministic HTML/SVG fixture modeled on the visual quality of `classroom-replica.html`.
4. Run HyperFrames lint/validate/inspect on the fixture.
5. Render the fixture to a shot MP4 and verify metadata.
6. Prepare assets and assert the generated asset manifest contains the shot.
7. Compose a minimal Remotion episode using the prepared shot plus a caption layer.
8. Render one still frame and the final MP4, then verify output metadata.

## Migration sequence

1. Add the shared renderer/output schemas and compatibility defaults.
2. Refactor `production/renderers.ts` around the new adapter protocol.
3. Update shot validation, rendering, and asset preparation commands to use declared source roots and output contracts.
4. Update the Remotion scene router to consume prepared shot assets for every visual scene.
5. Update episode scaffolding and documentation.
6. Add and run the HTML/SVG fixture through the complete pipeline.
7. Migrate existing episode templates and validate all episodes.

## Acceptance criteria

- A new HTML/SVG shot can be declared in a ShotBrief without editing the core renderer switch.
- The shot validates and previews through the adapter protocol.
- The shot renders to a declared artifact and is copied into the static asset registry.
- Remotion can compose that artifact with captions and episode timing.
- Existing scene implementations are migrated to browser-authored shot sources; no shot depends on Remotion drawing.
- Unsupported Manim/Blender paths fail clearly rather than silently degrading.
- The route is deterministic: no wall-clock animation, unseeded randomness, or hidden browser interaction is required.
