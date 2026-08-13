# Launcher Architecture

- Path: `ctx/docs/architecture/overview.skin.en.md`
- Changed: `20260813`

## Purpose

Make TeqFW composition deterministic.

## Mental Model

`bin/teq.mjs` composes the application before Bootstrap. Bootstrap starts plugins, creates the selected command, and Host runs and shuts it down. The host is the physical package root, a supplied root, or an explicitly selected host package.

## Scope

Includes:

- discovery, explicit host selection, DI, Bootstrap, commands, lifecycle, and signals.

Excludes:

- feature implementation and alternative process hosts.

## Invariants

- Bootstrap, plugin, and command resolution follow namespace registration, DI extensions, runtime config, and cfg loading.
- Only the selected root package is interpreted for host-related declarations.
- The explicit host declares canonical namespaces and depends on `@teqfw/cli`.
- Only an optional host configurator configures Container extensions.
- `bin/teq.mjs` is the only Composition Root.
- Plugins finish startup before command selection; commands are created after selection.
- Shutdown reverses completed work once.
- Composition is fail-fast; explicit host selection is the one validation boundary.

## Agent Document

overview.md
