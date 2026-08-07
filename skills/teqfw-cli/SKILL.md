---
name: teqfw-cli
description: Use this skill when integrating, using, testing, reviewing, or modifying a Node.js TeqFW application that uses @teqfw/cli as its process host, including host Container configuration, CLI command metadata and products, lifecycle plugins, signals, shutdown, or process results.
---

# @teqfw/cli

Use this skill for consumer code that composes or depends on the installed
`@teqfw/cli` package. Treat the host project's instructions, architecture, and
test conventions as authoritative.

## Apply

1. Install `@teqfw/cli` as a host production dependency and invoke its
   published `teq` executable through a package script. npm exposes it as
   `node_modules/.bin/teq` and adds that directory to script `PATH`; use
   `npm exec -- teq help` for an explicit local invocation (`--help` remains
   supported). Do not import
   `@teqfw/cli/src/**`; its runtime modules are DI-addressed.
2. Keep pre-Container composition in the executable. Only the host application may declare the pre-DI Container configurator and cfg Sources; plugins never create or configure a Container.
3. Declare commands and optional lifecycle components in the owning package's
   `teqfw.fw.cli` metadata. Discovery reads metadata only; it does not create a
   command product.
4. Treat cfg as mandatory CLI startup infrastructure: the CLI loads ordered host Sources exactly once before resolving lifecycle components. Implement a lifecycle component with onStartup() and onShutdown() only.
   Use ordinary declared DI dependencies; never receive the Container, the
   Bootstrap resolver, or the Host run.
5. Model a command as either finite `async execute(context)` or long-running
   `async start(context)` returning `{done, stop}`. Let only the executable set
   the process exit code.
6. Read the selected references before editing, then validate with the host
   project's tests.

## Select References

| Consumer task | Read |
| --- | --- |
| Understand boundaries, metadata ownership, or resolution timing | [Concepts](references/concepts.md) |
| Configure the host Container or add a CLI command | [Usage](references/usage.md) |
| Implement lifecycle participation, command lifetime, signals, or cleanup | [Lifecycle](references/lifecycle.md) |
| Mount or discover the installed skill | [Distribution](references/distribution.md) |

`@teqfw/cli` is a Node.js host and lifecycle coordinator. It does not make a
plugin a composition root, expose a general service locator, or let plugins
choose process exit status.
