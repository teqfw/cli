# Command and CLI Plugin Contracts

- Path: `ctx/docs/architecture/command-contract.md`
- Changed: `20260803`


A command descriptor is static package metadata. `teqfw.fw.cli.commands` is an array of objects with these required fields:

```json
{
  "id": "web:start",
  "path": ["web", "start"],
  "summary": "Start the web service.",
  "arguments": [],
  "options": [],
  "component": "Acme_Web_Cli_Command_Start$"
}
```

`id`, `path`, `summary`, `arguments`, and `options` use the existing command parser's DTO schema. `component` is the command product's Dependency Specifier. Bootstrap builds the command catalogue from descriptors and uses it for help, parsing, and selection without creating command products. The host default selects one descriptor by `id`.

A command product has explicit lifetime. A finite command has lifetime finite and async execute(context). A long-running command has lifetime long-running and async start(context), returning {done: Promise, stop(): Promise or void}. Both receive parsed input, launch context, and AbortSignal. Only Bootstrap creates a command product, and only after the descriptor is selected.

`TeqFw_Cli_Api_Plugin` is the public contract for an optional CLI plugin component. Its implementation is the DI product identified by its package's optional `teqfw.fw.cli.plugin` declaration and has both methods:

- `onStartup(): void | Promise<void>` connects the plugin package to the running application;
- `onShutdown(): void | Promise<void>` releases that connection during shutdown.

The public source uses the JSDoc `@interface` annotation. Every implementation uses `@implements {TeqFw_Cli_Api_Plugin}`. `onStartup` and `onShutdown` are the whole CLI plugin lifecycle; there are no separate initialize, activate, deactivate, or dispose phases. Each implementation obtains all integration dependencies through `__deps__`, including any extension registry owned by another plugin. It may configure such a registry but never configures or resolves through Container.
