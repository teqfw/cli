# Architecture Documentation

- Path: `ctx/docs/architecture/AGENTS.md`
- Changed: `20260803`

## Purpose

Defines host ownership, sequencing, contracts, ordering, rollback, and integrations.

## Level Map

- `overview.md` and skin — architecture entry.
- `container-configurator.md` — optional host Container configuration contract.
- `execution-lifecycle.md` — phases, rollback, signals, command cleanup.
- `plugin-activation.md` — `TeqFw_Cli_Api_Plugin`, ordering, resolver exception, and shutdown.
- `discovery.md` — runtime graph, static command catalogue, and metadata.
- `command-contract.md` — command descriptors and command products.
- `errors.md` — precedence and status mapping.
- `integration.md` — DI, logging, Node, parser boundaries.
- `decisions.md` — durable choices.

Do not introduce product meaning or source filenames here.
