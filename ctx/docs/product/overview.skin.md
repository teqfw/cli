# TeqFW Application Launcher

- Path: `ctx/docs/product/overview.skin.md`
- Changed: `20260728`


## Purpose

Provide one standard process entry point for executable TeqFW applications.

## Mental Model

The installed teq binary composes an application before Bootstrap starts it. Servers, workers, migrations, and maintenance operations are commands within one application runtime.

## Scope

Includes:

- launching, command selection, lifecycle, and controlled shutdown.

Excludes:

- feature behavior and direct plugin process termination.

## Invariants

- Application root and original cwd are different launch facts.
- Composition completes before Bootstrap resolution.
- Configurators extend but do not create or locate the Container.
- Metadata is broadcast-visible despite schema ownership.
- Finite and long-running commands are structurally distinct.

## Agent Document

overview.md
