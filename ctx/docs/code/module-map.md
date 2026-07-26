# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260726`

## DTO

- `Dto/Argument.mjs`, `Dto/Option.mjs`, `Dto/Command.mjs` — immutable data shells and validating factories.
- `Util/DeepFreeze.mjs` — shared recursive freezing helper.
- `Error.mjs` — categorized host error.

## Discovery And Registries

- `Infra/PackageGraph.mjs` — sole installed dependency traversal.
- `Registry/Provider.mjs` — provider metadata validation and ordering.
- `Registry/Command.mjs` — provider contract validation and duplicate rejection.

## Adapters And Lifecycle

- `Adapter/Parser/Commander.mjs` — private Commander mapping, typed input, help/version, and usage errors.
- `Adapter/Signal.mjs` — process signal subscription boundary.
- `Adapter/Io.mjs` — stdout/stderr boundary.
- `Runner.mjs` — selected-command lifecycle and status mapping.

## Bootstrap

- `Bootstrap.mjs` — library-side orchestration after infrastructure is supplied.
- `bin/teq.mjs` — static-import composition root, application-root selection, DI setup, and `process.exitCode`.
