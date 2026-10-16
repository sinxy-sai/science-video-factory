---
state: shot-design-approved
approvals:
  content: true
  storyboard: true
  shot-design: true
---

# Information Theory Shot Design

## System direction
The episode uses a dark information-grid system with a cyan accent, warm white text, thin rules, and precise geometric motion. The hero frame should read at 1920x1080 and remain legible in a small preview. Every shot has one dominant visual claim and a clear focal point.

## Shot 001 — uncertainty
Hero frame: a sealed box at center with eight faint candidate symbols orbiting behind it. Composition uses a centered subject, generous negative space, and a left-aligned question label. Focal point is the box latch. Hierarchy is question, box, candidate count, then supporting caption. Motion begins with a slow reveal, pauses on the unresolved state, and resolves when one answer removes alternatives. Transition exits through a cyan rule that becomes the next grid.

## Shot 002 — one bit
Hero frame: two equally sized panels labeled 0 and 1 with a single question marker between them. Composition is symmetrical and calm. Focal point is the split. The hierarchy is “two choices,” then the answer token, then “1 bit.” Motion states are enter, compare, answer, and settle. The transition folds the two panels into a binary branch so the viewer sees the question as a cut through possibility space.

## Shot 003 — repeated halving
Hero frame: a row of grids for 2, 4, and 8 possibilities, each annotated with the number of binary questions required. Composition flows left to right. Focal point moves one grid at a time, synchronized to narration. The hierarchy is count, question depth, then formula. Motion uses measured doubling and halving, with no decorative particles. Exit zooms into the final grid cell.

## Shot 004 — logarithm
Hero frame: the equation I = log2(N) appears beside a staircase of binary questions. Composition places the equation in the upper right and the staircase in the lower left. Focal point is the equality between question depth and logarithm. Motion writes the equation after the staircase completes, then highlights the base and argument separately. Transition carries the staircase line into a codeword ribbon.

## Shot 005 — coding
Hero frame: common symbols receive short code paths while rare symbols receive longer paths. Composition is a branching tree with labels kept outside branches. Focal point is the weighted path length. Hierarchy is symbol frequency, code length, then the compression takeaway. Motion reveals branches in order of frequency and keeps the tree stable between states. Exit compresses the tree into a compact message strip.

## Shot 006 — noisy channel
Hero frame: a message strip crosses a channel with a small disturbance, then arrives with a highlighted uncertain symbol. Composition is horizontal with sender and receiver anchored at edges. Focal point is the disturbed symbol. Motion introduces noise once, then adds a small redundancy marker. Transition fades to the closing statement without implying a complete treatment of channel capacity.

## Global composition rules
Use a 12-column grid, 8% safe margins, and consistent baseline alignment for equations and captions. Keep labels at least 32px at 1920x1080. Use cyan only for the active relationship or answer. Supporting text stays warm white or muted blue. Do not place important details behind animated overlays.

## Motion language
Entrances are short slides, fades, or scale settles with restrained easing. Transformations should preserve object identity so the viewer can follow what changed. Exits belong to transitions and should prepare the next hero frame. Avoid camera shake, random particle motion, and simultaneous unrelated reveals.

## Subtitles and narration sync
Each shot receives captions covering at least 80% of its duration. Captions mirror the approved narration and use line breaks that preserve mathematical meaning. Equation reveals must align with the spoken term they define. Leave a short hold after each key statement for reading.

## Asset plan
Prefer generated vector geometry, text, and simple iconography. Any external asset must include a source note, license status, and deterministic local path. The episode can render without network access after preparation. Keep the gsap runtime local for HyperFrames shots and keep Remotion scene assets inside the episode directory.

## Renderer mapping
Shots 001 through 006 use the HyperFrames adapter for grid and transition work. The Remotion episode composition remains the assembly path for final delivery. If a shot is later moved to Manim or Canvas, update this document, the ShotBrief, and the validation record together. Unsupported renderer values must fail validation.

## Continuity
Shot 001 leaves the possibility grid and cyan rule. Shot 002 inherits the rule and replaces the box with a binary split. Shot 003 inherits the split geometry and expands it into a sequence. Shot 004 inherits the staircase. Shot 005 inherits the line as a code path. Shot 006 inherits the path as a message channel. Color, typography, and caption placement remain stable throughout.

## Review checklist
Confirm every shot has one hero frame, one focal point, a readable hierarchy, explicit motion states, a transition, subtitle coverage, asset provenance, and a renderer. Confirm that the visual metaphor never claims more than the approved content plan. Confirm that all approvals remain true and that the front matter state is shot-design-approved before source authoring.

### Shot detail extension`nFor each shot, verify the first frame, midpoint, and final frame as separate review checkpoints. The first frame establishes context, the midpoint carries the claim, and the final frame hands a stable object to the transition. Record any frame that needs a hold for reading.

### Layout extension`nAlign repeated grids to the same origin so that doubling feels like a controlled change in scale. Keep equation baselines consistent across shots and reserve the top band for section labels. Leave enough contrast that thin rules survive video compression.

### Motion extension`nUse opacity and translation to introduce labels, then use one structural transform for the core relationship. Keep easing consistent across a scene. A transition may change camera position only after the outgoing claim has settled.

### Asset extension`nA generated asset is acceptable when it is deterministic and stored locally. Avoid untracked screenshots or remote fonts. Name files with shot identifiers so validation can report a precise missing asset path.

### Accessibility extension`nIf a viewer pauses on any representative frame, they should be able to identify the active count and the current question. Use shape, position, and labels together. Do not communicate a state only through cyan versus gray.

### Renderer extension`nHyperFrames files must declare composition dimensions and duration. Remotion scenes must remain importable from the episode module. Any alternate renderer needs an explicit source file, output contract, and actionable availability error.

### Transition extension`nTransitions are short and motivated by the shared object between shots. A rule can become a branch, a branch can become a code path, and a code path can become a channel. Keep the handoff visible for at least a few frames.

### Approval extension`nReview comments should reference shot IDs and frame states. Resolve comments in the plan before changing source files. Record the final decision in the planning history so subsequent renders have a stable reference.

### QA extension`nCheck representative stills for empty frames, clipping, unreadable text, and accidental placeholders. Compare baseline images only after the plan and renderer mapping are stable. Keep failures attached to the shot identifier.

### Revision extension`nIf timing changes, update duration, captions, transition holds, and the ShotBrief together. If a focal point changes, review continuity with both neighboring shots. If the renderer changes, rerun adapter validation before rendering.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

### Production detail
The shot should make one relationship easy to see: a count, a split, a depth, a code path, or a noisy transmission. Preserve that relationship through composition, motion, subtitles, and transition timing so the viewer can reconstruct the argument from the frames alone.

