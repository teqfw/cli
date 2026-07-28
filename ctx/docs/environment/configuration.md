# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260728`

`package.json` is the composition input. The DI package registry preserves the complete immutable `teqfw` object for every installed production package in dependency-first order. `teqfw.namespaces` describes ESM namespace roots; CLI interprets `teqfw.providers.cli` and `teqfw.providers.lifecycle` as DI tokens, while other `teqfw` instructions belong to their declared extension. Development dependencies are not discovered.

Lifecycle configuration belongs to the feature component injected through DI. Do not log secrets, arbitrary command input, or configuration values. The host itself accepts command paths, help, version, and documented typed values only.
