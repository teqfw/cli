# Testing

- Path: `ctx/docs/code/testing.md`
- Changed: `20260803`


Use node:test and isolated fixture applications. Unit tests cover runtime components such as Bootstrap and Host. Integration tests verify that the starter composes applications with and without a configurator and that static discovery does not instantiate command products. Acceptance tests execute the npm-style `node_modules/.bin/teq` launcher, not only the package's physical `bin/teq.mjs` file. Cover a plugin package with no `teqfw.fw.cli.plugin` declaration, dependency-first `onStartup` calls, reverse `onShutdown` calls after success, failure, and SIGINT, and verify that only Bootstrap receives the private resolver capability. Verify that an unselected command is never resolved, a selected command is resolved once after all startup calls succeed, and information closes started plugins with status 0. The starter verification contract is in [teq-starter.md](teq-starter.md). Run npm test, npm run validate:esm, and npm run validate:ctx.
