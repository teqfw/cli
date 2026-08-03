# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260803`


`bin/teq.mjs` is the self-contained physical process boundary and the only Composition Root; its complete implementation contract is [teq-starter.md](teq-starter.md). It performs composition before runtime modules are resolved. `src/Bootstrap.mjs` reads static package metadata, starts `TeqFw_Cli_Api_Plugin` components, and lazily resolves the selected command through the sole runtime resolution exception. `src/Host.mjs` controls handler and service lifetime, signals, and reverse plugin shutdown; DTOs validate command descriptors and products, and adapters isolate parser, IO, and signals.
