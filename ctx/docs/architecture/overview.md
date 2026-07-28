# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260728`


bin/teq.mjs captures argv and cwd, discovers the head root, builds production records, collects metadata, registers teqfw.fw.di.namespaces, loads the head configurator, applies extensions, then resolves TeqFw_Cli_Bootstrap$. Container configuration therefore completes before Bootstrap resolution.

Bootstrap receives immutable launch context and assembles active providers through the explicit launch resolver. Host owns lifecycle and command lifetime. Composition is not a plugin hook.
