# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260728`


@teqfw/cli is the standard Node.js application launcher for TeqFW. `bin/teq.mjs` is its Composition Root and hosts HTTP, workers, schedulers, migrations, and maintenance commands in one application runtime.

The Composition Root establishes the host application root independently of the original cwd, builds the production graph, optionally reads its Container configurator, configures DI, resolves Bootstrap, and controls lifecycle. A parser is only an operator interface, not the product identity. Composition is separate from plugin lifecycle, and plugins never terminate the process directly. A selected application can be a terminating handler or a long-running service.
