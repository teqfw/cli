# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260726`

## Product Identity

`@teqfw/cli` is the standard command-line host for modular TeqFW applications on `@teqfw/di` 2.x.
It lets an application expose commands supplied by the root package and installed runtime dependencies without coupling feature packages to a parser framework.

## Mission

Provide one predictable route from explicit package declarations to validated command execution, with centralized help, validation, cancellation, cleanup, output, and exit semantics.

## Scope

The host discovers provider tokens from package metadata, configures DI namespaces before resolution, aggregates immutable descriptors, parses a selected command, executes it with an abort signal, cleans it up exactly once, and reports a process-neutral result.

## Core Lifecycle

An application starts `teq`; the host reads the real installed dependency graph; registers every namespace root; resolves declared providers; validates and registers their commands; parses input; executes one command; then performs selected-command cleanup and maps the outcome to an exit code.

## Boundaries

In scope: metadata-only discovery, DI composition, parser-neutral contracts, help/version, validation, signals, cleanup, IO abstraction, and stable exit codes.

Out of scope for 0.1.0: interactive prompts, shell completion, remote or daemon execution, authorization, hot reload, filesystem/source-name discovery, legacy `@teqfw/core` DTOs, modifying DI/DB, publication, and a programmatic bootstrap API that bypasses the binary composition root.

## Product Invariants

- Providers and commands are explicit, ordered, immutable, and validated before execution.
- Runtime dependencies only participate in discovery; development-only packages do not.
- No provider is resolved until namespace configuration is complete.
- Feature code receives dependencies through constructors and never receives the container.
- Parser errors occur before command execution.
- Selected-command cleanup runs exactly once after success or failure.
- Library code never calls `process.exit()`.

## MVP Boundary

Version 0.1.0 exposes the `teq` executable and public DTO/provider types, uses Commander behind an adapter, and supports string, number, and boolean arguments/options.

## Documentation Map

Read `roles.md`, `use-cases.md`, and `glossary.md` for product detail.
