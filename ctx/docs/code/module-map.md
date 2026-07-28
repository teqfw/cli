# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260728`

- `Bootstrap.mjs` — composition and provider resolution.
- `Host.mjs` — phase controller, rollback, shutdown, signal outcome, lifecycle logging.
- `@teqfw/di/node/registry/package` — dependency-first immutable production package records used by composition; no local graph implementation exists.
- `Registry/Provider.mjs` — CLI/lifecycle metadata token validation.
- `Registry/Command.mjs` — command-provider products.
- `Registry/Lifecycle.mjs` — lifecycle-provider products and participant identity validation.
- `Adapter/Parser/Internal.mjs` — limited parser and parser-neutral invocation data.
- `Adapter/Signal.mjs`, `Adapter/Io.mjs` — Node boundaries.
- `Dto/*` — immutable command inputs.
- `bin/teq.mjs` — process boundary and `exitCode` assignment.
