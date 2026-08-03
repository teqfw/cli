# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260728`


`bin/teq.mjs` is the self-contained physical process boundary and the only Composition Root; its complete implementation contract is [teq-starter.md](teq-starter.md). It performs composition before runtime modules are resolved. `src/Bootstrap.mjs` starts the composed application, `src/Host.mjs` controls handler and service lifetime, DTOs validate command structure, and adapters isolate parser, IO, and signals.
