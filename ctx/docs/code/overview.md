# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260726`

## Language And Publication

Runtime code is pure JavaScript ESM for Node.js 20+.
Every `src/` module uses `// @ts-check`, a module `@namespace`/`@description` block, closure-based component behavior, and a final frozen export-scoped `__deps__` block when dependencies exist.
Static imports are forbidden in `src/` and allowed only in `bin/teq.mjs`.

## Namespace

Runtime components use `TeqFw_Cli_`.
Local export names remain short.
`types.d.ts` publishes namespace aliases plus public descriptor/context structures.
No identifier or compatibility path uses `TeqFw_Core_*`.

## Boundaries

Infrastructure is constructor-injected.
DTO factories perform defensive-copy validation and freezing.
The package graph traversal is implemented once and reused by provider discovery.
The binary contains composition, root detection, adapter construction, and exitCode assignment only.

## Checks

Run `npm test`, `npm run validate:esm`, `npm run validate:ctx`, syntax checks, export smoke resolution, `npm pack --dry-run`, and `git diff --check`.
