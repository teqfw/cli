# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260727`

- `Bootstrap.mjs` — composition and provider resolution.
- `Host.mjs` — phase controller, rollback, shutdown, signal outcome, lifecycle logging.
- `Infra/PackageGraph.mjs` — deterministic production dependency traversal.
- `Registry/Provider.mjs` — CLI/lifecycle metadata token validation.
- `Registry/Command.mjs` — command-provider products.
- `Registry/Lifecycle.mjs` — lifecycle-provider products and participant identity validation.
- `Adapter/Parser/Internal.mjs` — limited parser and parser-neutral invocation data.
- `Adapter/Signal.mjs`, `Adapter/Io.mjs` — Node boundaries.
- `Dto/*` — immutable command inputs.
- `bin/teq.mjs` — process boundary and `exitCode` assignment.
