# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.skin.en.md`
- Changed: `20260813`

## Purpose

Record durable architecture choices that govern composition, discovery, and runtime behaviour of @teqfw/cli.

## Mental Model

Fifteen decisions define one Composition Root, host ownership and explicit host selection, metadata, DI/cfg ordering, command selection/lifetime, private Host/resolver, and plugin startup/shutdown.

## Scope

Includes:

- host ownership, explicit host selection, metadata, DI/cfg order, command selection/lifetime, signals, shutdown, and private resolution.

Excludes:

- feature code, parser internals, and tool workflow.

## Invariants

- Only the selected host package manifest supplies host-related declarations.
- The explicit host must declare canonical `teqfw.fw.di.namespaces` and a dependency on `@teqfw/cli`.
- The host configurator is optional and never receives or creates a Container.
- Bootstrap, plugin, and command resolution follow namespace registration, DI extensions, runtime config, and cfg loading. Runtime config is the sole pre-cfg resolution.
- Command resolution is deferred until after all CLI plugin `onStartup` calls succeed.
- Bootstrap's private resolver capability is never exposed to plugins, commands, or Host.
- Shutdown reverses completed startup work exactly once.

## Agent Document

`decisions.md`
