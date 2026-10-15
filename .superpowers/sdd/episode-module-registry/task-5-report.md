# Task 5 Report — Route CLI workflow through the generated registry

## Status

Completed Task 5. CLI commands resolve episode modules through the generated static registry, the new-episode scaffold creates a self-contained episode module, and documentation describes the updated contract and workflow.

## Changed files

- `scripts/validate.ts` — validates a registry-loaded episode module.
- `scripts/validate-all.ts` — iterates `Object.keys(episodeRegistry)` and validates every entry.
- `scripts/preview.ts` — writes props from the registry-loaded module manifest.
- `scripts/still.ts` — writes props and snapshots from the registry-loaded module manifest.
- `scripts/render.ts` — writes props and snapshots from the registry-loaded module manifest.
- `scripts/new-episode.ts` — creates manifest, episode module, IntroScene, assets marker, and notes; regenerates the registry before printing next commands.
- `package.json` — adds `validate-all`; updates `test` to run registry generation, typecheck, and registry-wide validation.
- `README.md` — documents the self-contained episode contract, generated registry, and workflow.
- `docs/SCENE_GUIDE.md` — documents local visual schemas, episode modules, registry loading, and exact commands.

## Verification

- `npm run generate-registry` — passed.
- `npm test` — passed; ran `generate-registry`, `typecheck`, and `validate-all` for all three registered episodes.
- `npm run new-episode -- task-five-check` — passed; scaffold generation and registry regeneration succeeded. Temporary scaffold was removed afterward.
- `npm run typecheck` — passed after scaffold verification.
- `git diff --check` — passed.

## Commit

`20f9c57a37d75095af1441d231d926ab0ff1ea19` (implementation commit; report is in follow-up commit `8d3ec2bbe9516bd8aa80a9446f0417228c6f5191`)

Commit message: `refactor: route workflow commands through episode registry`

## Concerns

- `new-episode.ts` invokes npm with `shell: true`, matching the existing preview/render process style; Node emits its standard deprecation warning for this usage.
- Registry generation remains an explicit step for new episode directories and is also run automatically by `npm test` and `new-episode`.




