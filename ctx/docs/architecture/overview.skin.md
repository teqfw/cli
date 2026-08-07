# Launcher Architecture

- Path: `ctx/docs/architecture/overview.skin.md`
- Changed: `20260803`

## Purpose

Make TeqFW composition deterministic.

## Mental Model

`bin/teq.mjs` composes the application before Bootstrap. Bootstrap starts plugins, creates the selected command, and Host runs and shuts it down.

## Scope

Includes:

- discovery, DI, Bootstrap, commands, lifecycle, and signals.

Excludes:

- feature implementation and alternative process hosts.

## Invariants

- Bootstrap, plugin, and command resolution follow namespace registration, DI extensions, runtime config, and cfg loading. Runtime config is the sole pre-cfg resolution.
- Only the root npm package is interpreted for host-related declarations.
- Only an optional host configurator configures Container extensions.
- `bin/teq.mjs` is the only Composition Root.
- Every declared CLI plugin component finishes startup before command selection.
- A command is created only after selection.
- Shutdown reverses completed work once.
- Metadata ownership is not metadata secrecy.
- Composition is fail-fast: the starter trusts declarations and lets the first native operation fail; it does not validate, normalize, recover, or enrich startup-condition errors.
- Composition is not a plugin hook.

## Agent Document

overview.md
