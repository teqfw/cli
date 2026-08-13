# teq Starter

- Path: `ctx/docs/code/teq-starter.skin.en.md`
- Changed: `20260813`

## Purpose

Provide the single stable process boundary that composes every TeqFW host application.

## Mental Model

`bin/teq.mjs` captures `argv`, `cwd`, and native composition dependencies, establishes the host root, configures DI, and resolves Bootstrap through the Container.

## Scope

Includes:

- process execution and import by tests;
- host discovery and explicit host selection;
- DI configuration and dynamic host configurator loading;
- Bootstrap hand-off with launch facts and a private resolver.

Excludes:

- direct runtime imports, including Bootstrap;
- command selection, plugin lifecycle, version discovery, and application behavior.

## Invariants

- `bin/teq.mjs` is the only Composition Root.
- `--host`/`--host-root` precede the command identifier.
- The explicit host declares canonical namespaces and depends on `@teqfw/cli`.
- Namespace registration and configuration finish before the first resolution.
- The host configurator uses static imports only and never creates the Container.
- The starter passes launch facts and a private resolver, never the Container.

## Agent Document

`teq-starter.md`
