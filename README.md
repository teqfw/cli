# @teqfw/cli

@teqfw/cli is the standard TeqFW Node.js application launcher. Its installed teq binary is the physical process entry point and Composition Root.

## Startup

teq captures argv and cwd, discovers the head application, builds production package records, reads distributed metadata, registers namespaces, loads the application configurator, fully configures the Container, resolves Bootstrap, and starts the selected command.

Head discovery walks upward from the original cwd until it finds a package.json with teqfw.fw.cli.container.configurator. The discovered application root and original cwd are both retained in immutable launch context.

Put the head-owned configurator in bootstrap/container.mjs, not src. Its default export receives frozen applicationRoot, cwd, argv, manifest, package records, metadata, and invocation. It returns only {preprocessors, postprocessors}; it must not create the Container or locate services.

## Metadata

Runtime metadata uses teqfw.fw and teqfw.pkg. Framework protocols include teqfw.fw.di, teqfw.fw.cli, teqfw.fw.cfg, and teqfw.fw.log. Package protocols use the exact npm name as one key, including teqfw.pkg["@scope/package"].routes. Canonical paths use JavaScript property notation, for example teqfw.fw.cli.command.default.

Metadata path owner means schema owner and primary interpreter. Metadata remains broadcast-visible to all runtime packages. Namespace declarations are teqfw.fw.di.namespaces. The head application alone may publish teqfw.fw.cli.container.configurator and teqfw.fw.cli.command.default. Active packages contribute command and lifecycle providers through teqfw.fw.cli.commands and teqfw.fw.cli.lifecycle.

## Commands and shutdown

Selection is explicit command, head default command, then help. Help and version do not activate lifecycle participants. Finite commands have lifetime finite and async execute(context). Long-running commands have lifetime long-running and async start(context), returning {done, stop()}. Both receive AbortSignal.

Host runs initialize, activate, execute or start, deactivate, and dispose. Successful lifecycle work is reversed during cleanup. SIGINT and SIGTERM trigger exactly one cooperative shutdown. Only the executable assigns process.exitCode. Statuses are 0 success, 1 failure, 2 usage, 130 SIGINT, and 143 SIGTERM.

## Development

Run npm test, npm run validate:esm, and npm run validate:ctx.
