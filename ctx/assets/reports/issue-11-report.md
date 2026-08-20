# Issue #11 implementation report

Status: complete

## Relevance

Issue [#11](https://github.com/teqfw/cli/issues/11) is directly relevant to
`@teqfw/cli`: it corrects startup of the published `teq` executable through
the npm-created `node_modules/.bin/teq` symlink.

## Plan and execution

1. Confirm the reported Node.js 22.12.0 failure and locate the process guard.
2. Treat only `import.meta.main === true` as conclusive; retain the canonical
   path fallback for false and unavailable values, without changing PM2 logic.
3. Add a focused `node:test`-worker regression test and retain direct-launch
   and PM2 coverage.
4. Update the code-level context and public changelog. The README already
   documents npm `teq` use and needs no usage change.

## Changes

- `bin/teq.mjs`: false `import.meta.main` now falls through to the existing
  `fs.realpath(process.argv[1])` comparison.
- `test/acceptance/cli.test.mjs`: dedicated npm-symlink regression test runs
  from a `node:test` worker.
- `ctx/docs/code/teq-starter.md` and `testing.md`: runtime and verification
  contracts record the fallback behavior.
- `CHANGELOG.md`: records the user-visible bug fix.

## Verification checklist

- [x] `npm run test:acceptance` passes on Node.js v22.12.0.
- [x] npm symlink prints help from a `node:test` worker.
- [x] direct `bin/teq.mjs --help` acceptance coverage passes.
- [x] PM2 `pm_exec_path` acceptance coverage passes unchanged.
- [x] `npm test` passes: 9 unit, 27 integration, and 5 acceptance tests.
- [x] `npm run validate:esm` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run validate:ctx` passes with zero errors and warnings.
