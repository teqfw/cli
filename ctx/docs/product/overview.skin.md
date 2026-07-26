# CLI Host Product

- Path: `ctx/docs/product/overview.skin.md`
- Changed: `20260726`

## Purpose

Give TeqFW applications one reliable, extensible command-line host.

## Mental Model

The root application starts a host.
Runtime packages advertise providers explicitly; providers supply parser-neutral immutable commands; the host owns everything from discovery through cleanup.

## Scope

Includes:

- metadata and DI based composition;
- validation, execution, signals, cleanup, and exit status;
- a stable feature-package contract.

Excludes:

- filesystem command discovery and legacy Core DTOs;
- interactive, remote, daemon, authorization, and hot-reload features;
- direct process termination by library or feature code.

## Invariants

- DI is fully configured before provider resolution.
- Commander never leaks into public DTOs.
- Commands never use the container as a service locator.
- Cleanup runs exactly once for the selected command.
- Runtime discovery excludes development dependencies.

## Agent Document

`overview.md`
