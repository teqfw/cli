# Execution Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.skin.en.md`
- Changed: `20260803`

## Purpose

Define the deterministic runtime phases from Bootstrap hand-off through command execution, shutdown, and exit.

## Mental Model

Bootstrap builds static command descriptors from package metadata, opens a private Host run that installs a shutdown driver, resolves and starts every CLI plugin component in dependency-first package order, then selects a command descriptor and resolves exactly one command product. The run controls command lifetime, signals, rollback, and reverse plugin shutdown. Finite commands settle once; long-running commands cooperate with stop.

## Scope

Includes:

- Host run, plugin startup sequencing, signal-driven stop, command lifetime, rollback, and reverse shutdown.

Excludes:

- Container composition, namespace registration, configurator loading, and individual command behaviour.

## Invariants

- The shutdown driver is installed before the first `onStartup`.
- Only successfully started plugins are shut down.
- A command product is resolved only after all `onStartup` calls succeed and a descriptor is selected.
- Reverse `onShutdown` order is maintained.
- Shutdown runs exactly once; repeated signals do not restart it.
- Long-running commands receive a cooperative stop through `AbortSignal`.

## Agent Document

`execution-lifecycle.md`
