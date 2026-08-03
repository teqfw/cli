# Launcher Architecture

- Path: `ctx/docs/architecture/overview.skin.md`
- Changed: `20260728`


## Purpose

Make TeqFW application composition and runtime shutdown deterministic.

## Mental Model

`bin/teq.mjs` is the Composition Root. It configures a Container from production metadata and optional host instructions before resolving Bootstrap. Bootstrap assembles active plugins and Host runs lifecycle.

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
- Usage failures occur before lifecycle hooks.
- Shutdown reverses completed work once.
- Metadata ownership is not metadata secrecy.

## Agent Document

overview.md
