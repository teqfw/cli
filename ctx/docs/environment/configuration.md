# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260727`

`package.json` is the composition input. `teqfw.namespaces` describes ESM namespace roots; `teqfw.providers.cli` and `teqfw.providers.lifecycle` describe DI tokens. Only installed production dependencies are discovered.

Lifecycle configuration belongs to the feature component injected through DI. Do not log secrets, arbitrary command input, or configuration values. The host itself accepts command paths, help, version, and documented typed values only.
