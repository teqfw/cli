# @teqfw/cli

`@teqfw/cli` is the CLI host for modular TeqFW applications using `@teqfw/di` 2.x.
It discovers explicitly declared command providers in the root package and installed runtime dependencies, resolves them through DI, builds a Commander-backed CLI, executes one selected command, and owns validation, signals, cleanup, diagnostics, and exit status.

The public provider and command contracts do not depend on Commander.

## Requirements

- Node.js 20 or newer.
- `@teqfw/di` 2.7 or a compatible 2.x release.
- ESM packages with TeqFW namespace metadata.

Commander 14 is used internally because it is the current stable Commander line compatible with the Node 20 runtime floor.

## Installation

```bash
npm install @teqfw/cli @teqfw/di
```

The package installs the `teq` executable.
Run it from the application root:

```bash
teq --help
teq --version
teq <realm> <command>
```

## Declaring A Provider

A feature package advertises providers explicitly in `package.json`:

```json
{
  "teqfw": {
    "namespaces": [
      {
        "prefix": "Vendor_Package_",
        "path": "./src",
        "ext": ".mjs"
      }
    ],
    "providers": {
      "cli": [
        "Vendor_Package_Back_Cli_Provider$"
      ]
    }
  }
}
```

The host reads the root package and the transitive closure of installed `dependencies`.
It does not inspect `devDependencies`, source filenames, directories, or exports to guess providers.
Scoped, nested, and hoisted packages are supported.
Missing installed dependencies, malformed metadata, invalid CDC tokens, and duplicate provider tokens stop startup.

## Provider Contract

A provider is resolved by DI and returns a frozen ordered command list:

```js
// @ts-check

/**
 * @namespace Vendor_Package_Back_Cli_Provider
 * @description Publishes package commands to the TeqFW CLI host.
 */

export default class Provider {
    /**
     * @param {object} deps
     * @param {Vendor_Package_Back_Cli_Export$} deps.exportCommand
     */
    constructor({exportCommand}) {
        const commands = Object.freeze([exportCommand.get()]);

        /**
         * @returns {object}
         */
        this.getCommands = function () {
            return commands;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        exportCommand: 'Vendor_Package_Back_Cli_Export$',
    }),
});
```

Commands enter providers through `__deps__`.
Providers and commands must not look up dependencies from the Container.

## Command Example

The DI component below creates a parser-neutral immutable descriptor through the host factory.
Feature services are constructor-injected and captured by the command closure.

```js
// @ts-check

/**
 * @namespace Vendor_Package_Back_Cli_Export
 * @description Exports feature data through a CLI command.
 */

export default class ExportCommand {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Dto_Command__Factory$} deps.commandFactory
     * @param {Vendor_Package_Back_Service_Exporter$} deps.exporter
     */
    constructor({commandFactory, exporter}) {
        const command = commandFactory.create({
            id: 'db:export',
            path: ['db', 'export'],
            summary: 'Export database data',
            description: 'Writes an export to the selected target.',
            arguments: [],
            options: [{
                name: 'file',
                short: 'f',
                kind: 'string',
                required: true,
                repeatable: false,
                description: 'Output file path',
            }],
            execute: async function ({options, signal}) {
                await exporter.export({file: options.file, signal});
            },
            cleanup: async function () {
                await exporter.close();
            },
        });

        /**
         * @returns {TeqFw_Cli_Dto_Command}
         */
        this.get = function () {
            return command;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        commandFactory: 'TeqFw_Cli_Dto_Command__Factory$',
        exporter: 'Vendor_Package_Back_Service_Exporter$',
    }),
});
```

`execute()` receives:

```ts
{
  args: Readonly<Record<string, unknown>>;
  options: Readonly<Record<string, unknown>>;
  signal: AbortSignal;
}
```

Arguments and options support `string`, `number`, and `boolean`.
Arguments may be required or variadic.
Options may have a one-character short alias, be required, or be repeatable.
Factories normalize omitted booleans, make defensive copies, validate defaults and layout, and deeply freeze descriptor data.

Boolean positional arguments accept `true`, `false`, `1`, or `0`.
A repeatable boolean option takes an explicit boolean value so every occurrence can be retained.

## Lifecycle And Cleanup

The host installs SIGINT/SIGTERM handlers and gives the selected command an `AbortSignal`.
The first supported signal aborts the signal.
The host waits for execution settlement and then invokes the selected command's `cleanup()` exactly once.

Cleanup runs after success and after execution failure.
If execution and cleanup both fail, the execution error remains primary and the cleanup error is also reported.
Help, version, startup failure, and parser failure do not select a command and therefore do not run command cleanup.

Feature commands must not call `process.exit()`, return exit codes, invoke a general `app.stop()`, or terminate unrelated application services.
Library code returns a status; only `bin/teq.mjs` assigns `process.exitCode`.

## Exit Status

| Status | Meaning |
| ---: | --- |
| `0` | Success, help, or version |
| `1` | Startup or operational failure |
| `2` | Usage or input-validation failure |
| `130` | Interrupted by SIGINT |
| `143` | Interrupted by SIGTERM |

Normal output and help use stdout.
Usage and operational diagnostics use stderr.

## Discovery And DI Ordering

The binary treats the current working directory as the application root.
It builds namespace entries through the public `@teqfw/di/src/Config/NamespaceRegistry.mjs`, adds every namespace root to the Container, builds the provider registry, and only then performs the first `container.get()`.
The Container resolves the complete feature graph, command registry, parser adapter, and runner.

## 0.1.0 Limitations

The initial release intentionally excludes interactive prompts, shell completion, remote execution, daemon mode, authorization, hot reload, filesystem command discovery, legacy `@teqfw/core` DTO compatibility, and a second programmatic bootstrap API.
Provider metadata and immutable command descriptors are the only discovery/registration route.

## Development

```bash
npm test
npm run validate:esm
npm run validate:ctx
npm pack --dry-run
```

Tests use `node:test`, local temporary package fixtures, real `@teqfw/di` 2.x integration, and subprocess acceptance.
They require no network, external database, or globally installed `teq`.

## License

Apache-2.0.
