# @teqfw/cli

@teqfw/cli is the standard TeqFW Node.js application launcher. `bin/teq.mjs` is its self-contained physical process entry point and Composition Root.

## Startup

teq captures argv and cwd, derives the host application root from its mounted node_modules path, reads the host manifest, builds production package records, optionally loads the application configurator, configures the Container, and resolves Bootstrap. Bootstrap then reads the static package graph to select and start the command.

The host root is derived from node_modules/@teqfw/cli/bin/teq.mjs. Only its package.json is interpreted for host-related declarations.

The host may declare an optional configurator module, relative to its root, in teqfw.fw.cli.container.configurator. Its default-exported class implements TeqFw_Cli_Api_Container_Configurator; configure() receives applicationRoot and argv. It may return namespaceRoots, preprocessors, postprocessors, and logging instructions; it must not create the Container or locate services.

## Metadata

Runtime metadata uses teqfw.fw and teqfw.pkg. Framework protocols include teqfw.fw.di, teqfw.fw.cli, teqfw.fw.cfg, and teqfw.fw.log. Package protocols use the exact npm name as one key, including teqfw.pkg["@scope/package"].routes. Canonical paths use JavaScript property notation, for example teqfw.fw.cli.command.default.

Metadata path owner means schema owner and primary interpreter. Metadata remains broadcast-visible to all runtime packages. Namespace declarations are teqfw.fw.di.namespaces. The host application alone may publish teqfw.fw.cli.container.configurator and teqfw.fw.cli.command.default. Active packages contribute command and lifecycle providers through teqfw.fw.cli.commands and teqfw.fw.cli.lifecycle.

## Commands and shutdown

Selection is explicit command, head default command, then help. Help and version do not activate lifecycle participants. Finite commands have lifetime finite and async execute(context). Long-running commands have lifetime long-running and async start(context), returning {done, stop()}. Both receive AbortSignal.

Host runs initialize, activate, execute or start, deactivate, and dispose. Successful lifecycle work is reversed during cleanup. SIGINT and SIGTERM trigger exactly one cooperative shutdown. Only the executable assigns process.exitCode. Statuses are 0 success, 1 failure, 2 usage, 130 SIGINT, and 143 SIGTERM.

## Development

Run npm test, npm run validate:esm, and npm run validate:ctx.
