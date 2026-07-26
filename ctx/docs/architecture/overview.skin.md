# CLI Host Architecture

- Path: `ctx/docs/architecture/overview.skin.md`
- Changed: `20260726`

## Purpose

Keep discovery, composition, parsing, and execution predictable and independently testable.

## Mental Model

Treat startup as a gated pipeline.
Installed packages become namespace and provider registries before any DI resolution; validated immutable commands then enter a parser adapter; one runner owns the complete selected-command lifecycle.

## Scope

Includes:

- package graph, namespace/provider/command registries;
- parser and Node infrastructure adapters;
- execution, cancellation, cleanup, and outcome mapping.

Excludes:

- feature business logic and service lookup;
- persistence and background service ownership;
- parser objects in public contracts.

## Invariants

- One component owns dependency traversal.
- Namespace configuration precedes all container resolution.
- Registries fail closed on malformed or duplicate declarations.
- Runner cleanup is exactly once and preserves the primary error.
- Binary contains composition only.

## Agent Document

`overview.md`
