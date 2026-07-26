# Testing

- Path: `ctx/docs/code/testing.md`
- Changed: `20260726`

## Unit

Use `node:test` for DTO defaults/types/normalization/copies/freezing, metadata errors/order, duplicate providers/command IDs/paths, parser typing, status mapping, cleanup precedence, and AbortSignal behavior.

## Integration

Build temporary installed-package fixtures with root, transitive, scoped, and hoisted packages.
Use the real DI 2.x Container and NamespaceRegistry.
Prove the full provider graph resolves and prove no `container.get()` occurs before namespace configuration finishes.

## Acceptance

Spawn the real `bin/teq.mjs` against an isolated fixture.
Cover help, version, success, unknown command, missing required option, operational exception, stdout/stderr, cleanup after success/error, and SIGINT when supported.

## Constraints

Tests require no network, database, global CLI, or external service.
Fixtures are deterministic and package-local.
Run test groups independently and through the aggregate script.
