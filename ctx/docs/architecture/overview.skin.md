# Launcher Architecture

- Path: `ctx/docs/architecture/overview.skin.md`
- Changed: `20260803`

## Purpose

Make TeqFW application composition and runtime shutdown deterministic.

## Mental Model

`bin/teq.mjs` is the Composition Root. It configures a Container from production metadata and optional host instructions before resolving Bootstrap. Bootstrap starts CLI plugin components, creates only the selected command, and Host runs it and shuts it down.

## Scope

Includes:

- discovery, metadata, DI extensions, Bootstrap, commands, lifecycle, and signals.

Excludes:

- feature implementation and alternative process hosts.

## Invariants

- No resolution precedes namespace registration and configuration.
- Only the root npm package is interpreted for host-related declarations.
- Only an optional host configurator configures Container extensions.
- `bin/teq.mjs` is the only Composition Root.
- Every declared CLI plugin component finishes startup before command selection.
- A command is created only after selection.
- Shutdown reverses completed work once.
- Metadata ownership is not metadata secrecy.
- Composition is fail-fast: the starter trusts declarations and lets the first native operation fail; it does not validate, normalize, freeze, recover, or enrich startup-condition errors.
- Composition is not a plugin hook.

## Agent Document

overview.md
