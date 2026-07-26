# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260726`

## Style

The host is a pipeline of narrow components composed through TeqFW DI.
Public data contracts are immutable and parser-neutral; infrastructure adapters isolate Node process facilities, filesystem/package traversal, IO, signals, and Commander.

## Major Areas

- Bootstrap establishes the application root and Node infrastructure.
- Package traversal is the single source of the runtime package closure.
- Namespace and provider registries derive configuration from that same closure.
- Provider resolution converts DI components into validated command descriptors.
- Command registry rejects identity/path ambiguity and supplies deterministic input.
- Parser adapter owns help, version, input coercion, and usage validation.
- Runner owns abort state, signal subscription, execution, cleanup, reporting, and exit mapping.

## Critical Sequence

Bootstrap builds the package graph.
The public DI NamespaceRegistry builds namespace roots from the same application root.
Every root is added to the Container.
Only then may provider tokens or the runner be resolved.
Commands are fully validated before the parser accepts an invocation.

## State

All discovery and registry state is invocation-local and in memory.
The command descriptors are frozen sources of truth.
The first termination signal sets abort state; signal observation does not execute cleanup directly.

## Dependency

This architecture realizes `../product/overview.md` and must not redefine its scope.
Read `discovery.md`, `command-contract.md`, `execution-lifecycle.md`, `errors.md`, `integration.md`, and `decisions.md` for details.
