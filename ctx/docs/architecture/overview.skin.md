# Application Host Architecture

- Path: `ctx/docs/architecture/overview.skin.md`
- Changed: `20260727`

## Purpose

Keep application composition, lifecycle, command execution, and shutdown deterministic.

## Mental Model

Composition validates a runtime graph before plugins run. The host moves eligible participants forward, then reverses completed work during shutdown.

## Scope

Includes:

- DI, discovery, lifecycle providers, parser-neutral commands, signals, logging, and result mapping.

Excludes:

- feature business logic and alternative application hosts.

## Invariants

- Namespace configuration precedes every DI resolution.
- Lifecycle hooks never run during composition.
- Forward order is deterministic; shutdown reverses completed order.
- Shutdown is best-effort with stable primary-error precedence.
- One host owns signal-to-shutdown conversion.

## Agent Document

`overview.md`
