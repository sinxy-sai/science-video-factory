# Scripts

The scripts are grouped by role:

- `commands/` — user-facing CLI entry points. The names and npm commands remain stable.
- `lib/` — shared command helpers and workflow validation.
- `tests/` — focused contract tests invoked by `npm test`.

Use the npm scripts in `package.json` instead of calling files by path. This keeps the command surface stable if the internal organization changes.
