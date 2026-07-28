# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260728`


@teqfw/cli is the standard Node.js application launcher for TeqFW. Its teq executable hosts HTTP, workers, schedulers, migrations, and maintenance commands in one application runtime.

The launcher discovers the head application from the original cwd, builds the production graph, configures DI, resolves Bootstrap, and controls lifecycle. A parser is only an operator interface, not the product identity. Composition is separate from plugin lifecycle, and plugins never terminate the process directly.
