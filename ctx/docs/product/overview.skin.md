# TeqFW Node.js Application Host

- Path: `ctx/docs/product/overview.skin.md`
- Changed: `20260727`

## Purpose

Give every standard TeqFW Node.js application one process host and composition root.

## Mental Model

The operator selects an operating mode; the host assembles and controls the application around it. Servers, workers, and schedulers are runtime plugins inside that application.

## Scope

Includes:

- composition, lifecycle, commands, interruption, and outcome reporting.

Excludes:

- feature business behavior, direct process termination, and parser-framework contracts.

## Invariants

- Application lifecycle is distinct from command execution.
- Runtime plugins participate through explicit lifecycle providers.
- Plugins use DI rather than container lookup.
- The host controls one orderly shutdown.
- Development dependencies are outside runtime discovery.

## Agent Document

`overview.md`
