# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260726`

## TeqFW DI

`@teqfw/di` 2.x is a peer dependency and bootstrap dependency.
The public NamespaceRegistry is responsible for namespace discovery.
The Container is configured through `addNamespaceRoot()` and resolves providers/runner only after configuration.
The CLI host does not modify or deep-import non-exported DI internals.

## Feature Packages

Feature packages declare namespace entries and `teqfw.providers.cli` in `package.json`.
Provider tokens address DI components.
Providers return host DTOs and inject command dependencies; no registration callback or filesystem convention exists.

## Commander

Commander is a private adapter dependency.
Its commands, options, callbacks, errors, and flag syntax do not cross the public contract.
The selected major must support the package's Node 20 floor.

## Node Process

The binary determines the application root, supplies filesystem/path/process adapters, and assigns `process.exitCode`.
Signal and IO access are adapter-mediated for deterministic tests.
