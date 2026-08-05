# teq Starter

- Path: `ctx/docs/code/teq-starter.skin.md`
- Changed: `20260803`

## Purpose

Provide the single stable process boundary that composes every TeqFW host application.

## Mental Model

`bin/teq.mjs` captures `argv`, `cwd`, and native Node.js composition dependencies, establishes the host root, configures DI, then resolves Bootstrap through the Container. Bootstrap runs the application.

## Scope

Includes:

- process execution and import by tests;
- host discovery and DI configuration;
- dynamic loading of the pre-Container host configurator;
- Bootstrap hand-off with launch facts and a private resolver.

Excludes:

- direct runtime imports, including Bootstrap;
- command selection, plugin lifecycle, application-version discovery, and application behavior.

## Invariants

- `bin/teq.mjs` is the only Composition Root.
- Namespace registration and configuration finish before the first resolution.
- Bootstrap is resolved through the configured Container, never statically imported.
- The dynamic host configurator uses static imports only; it supplies declarations and never creates or locates the Container.
- The starter passes launch facts and a private get-only resolver to Bootstrap, never the Container.
- Bootstrap keeps the resolver private and uses it only for declared CLI plugins and the selected command.

## Agent Document

`teq-starter.md`
