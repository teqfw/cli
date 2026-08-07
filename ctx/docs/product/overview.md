# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260807`

@teqfw/cli is the standard Node.js application launcher for TeqFW. `bin/teq.mjs` is its Composition Root and hosts HTTP, workers, schedulers, migrations, and maintenance commands in one application runtime.

The Composition Root establishes the host application root independently of the original cwd, builds the production graph, loads cfg through the host configurator ordered Sources, configures DI, and resolves Bootstrap. Bootstrap starts the application's declared CLI plugin components before selecting a command, resolves only the selected command, and coordinates its execution and shutdown. A parser is only an operator interface, not the product identity. Plugins never terminate the process directly. A selected application can be a terminating handler or a long-running service.
