# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260726`

## Terms

- **Application root** — real directory containing the root `package.json` whose runtime dependency closure defines one CLI application.
- **Runtime package graph** — root package plus the transitive closure of installed `dependencies`, excluding `devDependencies`.
- **Namespace root** — mapping from a TeqFW namespace prefix to a real source directory and ESM extension.
- **Provider token** — valid TeqFW CDC specifier declared in `teqfw.providers.cli`.
- **Command provider** — DI-resolved component exposing synchronous `getCommands()` and returning an immutable ordered command list.
- **Command descriptor** — parser-neutral immutable definition containing identity, path, documentation, inputs, execution, and optional cleanup.
- **Selected command** — the single descriptor whose parser action began; only it is eligible for lifecycle cleanup.
- **Usage error** — invalid operator input detected before execution.
- **Operational error** — startup, provider resolution, execution, or cleanup failure.
- **Cleanup** — optional selected-command finalizer owned and called exactly once by the host.

Avoid “realm” for command path segments and avoid legacy “Core command DTO”.
