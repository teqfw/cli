# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260813`

@teqfw/cli is the standard Node.js application launcher for TeqFW. `bin/teq.mjs` is its Composition Root and hosts HTTP, workers, schedulers, migrations, and maintenance commands in one application runtime.

The Composition Root establishes the host application root independently of the original cwd, builds the production graph, loads configuration through cfg, configures DI, and resolves Bootstrap. Bootstrap starts the application's declared CLI plugin components before selecting a command, resolves only the selected command, and coordinates its execution and shutdown. A parser is only an operator interface, not the product identity. Plugins never terminate the process directly. A selected application can be a terminating handler or a long-running service.

A host may be selected explicitly by package name with `--host <package>` and an optional `--host-root <path>`; a globally installed TeqFW package that declares commands can then be launched through the standard `teq` executable without a package-owned launcher. Without `--host`, the local host application is discovered from the launcher's installation context.

Computed launch facts are exposed through the immutable DI component `TeqFw_Cli_Config$`. It provides applicationRoot, cwd, parser argv, and dotenv selection facts; these platform facts are distinct from user configuration and are available to plugins and commands before they are resolved.