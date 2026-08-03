# @teqfw/cli

@teqfw/cli is the standard TeqFW Node.js application launcher. `bin/teq.mjs` is its self-contained physical process entry point and Composition Root.

Node.js 20 or later is supported. The published `teq` executable works both when invoked directly and through npm's `node_modules/.bin/teq` symlink.

## Install and run

Install `@teqfw/cli` as a production dependency of the host application. Its
published `bin` declaration makes `teq` available at
`node_modules/.bin/teq`; npm adds that directory to `PATH` for package scripts.

```json
{
  "scripts": {
    "start": "teq web:start",
    "migrate": "teq db:migrate"
  }
}
```

Run `npm run start` or `npm run migrate`. For an explicit local invocation, use
`npm exec -- teq help` or `./node_modules/.bin/teq help`; `--help` and `-h`
remain supported. Use `teq version` (or `teq --version`) to print the host
application version. A global install is not required.

## Startup

teq captures argv and cwd, resolves the host application root from its physical package location, reads the host manifest, builds production package records, optionally loads the application configurator, configures the Container, and resolves Bootstrap. Bootstrap reads static package metadata, starts declared CLI plugin components, selects a command, and resolves only that command.

In an installed package, the host root is the parent of the enclosing `node_modules` directory. In a development checkout whose package root has `node_modules`, that package root is used instead. Only the selected host package.json is interpreted for host-related declarations.

The host may declare an optional configurator module, relative to its root, in teqfw.fw.cli.container.configurator. Its default-exported class implements TeqFw_Cli_Api_Container_Configurator; configure() receives applicationRoot and argv. It may return namespaceRoots, preprocessors, postprocessors, and logging instructions; it must not create the Container or locate services.

## Metadata

Runtime metadata uses teqfw.fw and teqfw.pkg. Framework protocols include teqfw.fw.di, teqfw.fw.cli, teqfw.fw.cfg, and teqfw.fw.log. Package protocols use the exact npm name as one key, including teqfw.pkg["@scope/package"].routes. Canonical paths use JavaScript property notation, for example teqfw.fw.cli.command.default.

Metadata path owner means schema owner and primary interpreter. Metadata remains broadcast-visible to all runtime packages. Namespace declarations are teqfw.fw.di.namespaces. The host application alone may publish teqfw.fw.cli.container.configurator and teqfw.fw.cli.command.default. A package may declare one optional TeqFw_Cli_Api_Plugin component in teqfw.fw.cli.plugin. teqfw.fw.cli.commands is an array of static descriptors with id, summary, optional arguments and options arrays, and component. Omit either array when the command accepts no corresponding input; an explicitly supplied value must be an array. The id is the command's sole public name: `teq web:start` selects `web:start`; component is resolved only after its descriptor is selected.

## Commands and shutdown

Declared CLI plugin components run onStartup before selection. Selection is explicit command, head default command, then help. Help and version create no command, close started plugins, and return 0. Finite commands have lifetime finite and async execute(context). Long-running commands have lifetime long-running and async start(context), returning {done, stop()}. Both receive AbortSignal.

Host runs one private run: it starts components through onStartup, executes an optional selected command, then invokes onShutdown for successfully started components in reverse order. SIGINT and SIGTERM trigger exactly one cooperative shutdown. Only the executable assigns process.exitCode. Statuses are 0 success or information, 1 failure, 2 usage, 130 SIGINT, and 143 SIGTERM.

## Development

Run npm test, npm run validate:esm, and npm run validate:ctx.
