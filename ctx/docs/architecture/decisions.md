# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260726`

## AD-001 Metadata-Only Provider Discovery

Decision: discover providers only through `teqfw.providers.cli` across the real runtime dependency graph.
Rejected: source-name, directory, export, or namespace scanning.
Reason: package authors retain explicit control and startup remains deterministic.

## AD-002 Configure DI Before Resolution

Decision: build namespace roots through the public DI NamespaceRegistry and add all roots before the first Container `get()`.
Rejected: resolving providers during traversal.
Reason: DI 2.x locks builder configuration at first resolution.

## AD-003 Parser-Neutral Immutable DTO

Decision: public command data contains semantic arguments/options and functions, not Commander constructs.
Rejected: Commander flags and instances in feature packages; legacy Core/DB DTO reuse.
Reason: adapters remain replaceable and validation has one owner.

## AD-004 Host-Owned Lifecycle

Decision: one runner owns signals, abort, errors, cleanup, IO diagnostics, and exit mapping.
Rejected: feature commands stopping the application or returning exit codes.
Reason: guarantees must hold uniformly across packages.

## AD-005 Commander 14 For Node 20

Decision: use the current stable Commander line that supports Node 20.
Rejected: Commander 15, whose runtime floor is Node 22.12.
Reason: the package contract is Node.js 20 or newer.

## AD-006 No Bootstrap Convenience API In 0.1.0

Decision: the supported process composition boundary is `bin/teq.mjs`; internal components remain namespace-addressable for DI and tests.
Rejected: a second public bootstrap API in the initial release.
Reason: avoid two application-root and process ownership contracts before real consumers establish the need.
