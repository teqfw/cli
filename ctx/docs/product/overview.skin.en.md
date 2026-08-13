# TeqFW Application Launcher

- Path: `ctx/docs/product/overview.skin.en.md`
- Changed: `20260813`

## Purpose

Provide one standard process entry point for executable TeqFW applications.

## Mental Model

The installed `bin/teq.mjs` is the Composition Root. It composes an application before Bootstrap starts it. Servers, workers, migrations, and maintenance operations are commands within one application runtime. A host is the local application or an explicitly selected global package.

## Scope

Includes:

- launching, explicit host selection, command selection, lifecycle, and controlled shutdown.

Excludes:

- feature behavior and direct plugin process termination.

## Invariants

- Application root and original cwd are different launch facts.
- The explicit host must declare canonical namespaces and a dependency on `@teqfw/cli`.
- The host configurator is optional.
- Composition completes before Bootstrap resolution.
- Configurators extend but do not create or locate the Container.
- Metadata is broadcast-visible despite schema ownership.
- Declared CLI plugin components finish startup before command selection.
- Finite and long-running commands are structurally distinct.
- Plugins never terminate the process directly.
- A parser is only an operator interface, not the product identity.

## Agent Document

overview.md
