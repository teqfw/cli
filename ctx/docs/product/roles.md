# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260726`

## Application Assembler

Owns the root application package, installs runtime feature packages, declares root providers, and launches `teq`.
The assembler controls which installed dependency graph forms the application.

## Feature Package Maintainer

Publishes namespace metadata and `teqfw.providers.cli` tokens.
Supplies providers through DI and injects feature dependencies into command components.
Does not own parsing, signals, process exit, or global application shutdown.

## CLI Operator

Invokes help, version, or a command; supplies input; consumes stdout/stderr; and observes the documented exit status.
The operator may interrupt an active command with SIGINT or SIGTERM.

## CLI Host Maintainer

Maintains discovery, validation, parser adaptation, lifecycle, and compatibility of the public descriptor contract.
Changes to metadata shape, DTO semantics, exit mapping, or cleanup guarantees require explicit Human approval and documentation synchronization.

## Invariants

Provider authors control command behavior.
The host controls orchestration.
Operators control invocation and interruption.
No role may bypass immutable descriptor validation.
