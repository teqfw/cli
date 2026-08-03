# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.skin.md`
- Changed: `20260803`


## Purpose

Record durable architecture choices that govern composition, discovery, and runtime behaviour of @teqfw/cli.

## Mental Model

Ten decisions define the launcher's structural rules: one Composition Root, one host package, an optional configurator, broadcast-visible metadata, configuration-before-resolution ordering, deterministic command selection, structurally distinct command lifetimes, a private Host run for signals and shutdown, a private resolver capability kept out of runtime, and deferred command resolution after plugin startup.

## Scope

Includes:

- host-role boundaries, metadata protocols, DI configuration ordering, command selection precedence, command lifetime classification, signal and shutdown ownership, and the private resolution capability.

Excludes:

- feature implementation, parser internals, and tool-specific workflow semantics.

## Invariants

- Only the host package manifest supplies host-related declarations.
- The host configurator is optional and never receives or creates a Container.
- Namespace registration and DI extensions precede any resolution.
- Command resolution is deferred until after all CLI plugin `onStartup` calls succeed.
- Bootstrap's private resolver capability is never exposed to plugins, commands, or Host.
- Shutdown reverses completed startup work exactly once.

## Agent Document

`decisions.md`
