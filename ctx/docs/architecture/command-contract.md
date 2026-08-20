# Command and CLI Plugin Contracts

- Path: `ctx/docs/architecture/command-contract.md`
- Changed: `20260817`

A command descriptor is static package metadata. `teqfw.fw.cli.commands` is an array of objects with required `id`, `summary`, and `component` fields. `arguments` and `options` are optional arrays; when omitted, each becomes an immutable empty array. If supplied, either field must be an array:

```json
{
  "id": "web:start",
  "summary": "Start the web service.",
  "arguments": [],
  "options": [],
  "component": "Acme_Web_Cli_Command_Start$"
}
```

`id`, `summary`, `arguments`, and `options` use the existing command parser's DTO schema. `id` is the sole public command identity: an operator selects `web:start` with `teq web:start`, and help displays that same identifier. `component` is the command product's Dependency Specifier. Bootstrap builds the command catalogue from descriptors and uses it for help, parsing, and selection without creating command products. The host default selects one descriptor by `id`.

A command product has explicit lifetime. A finite command has lifetime finite and async execute(context). A long-running command has lifetime long-running and async start(context), returning {done: Promise, stop(): Promise or void}. Both receive parsed input, launch context, and AbortSignal. Only Bootstrap creates a command product, and only after the descriptor is selected.

Command descriptors are read from package metadata; see [discovery.md](discovery.md) for the metadata schema and discovery order.

## Command Product Creation

After Bootstrap selects a descriptor, it resolves the descriptor's `component` Dependency Specifier through its private resolution capability. The DI Container instantiates the component's class. The constructor must return a plain object carrying the command shape: `id`, `summary`, `lifetime`, optional `arguments` and `options` arrays, and either `execute` (finite) or `start` (long-running). Missing input arrays become immutable empty arrays; supplied input fields must be arrays. An optional `cleanup` function runs after execution regardless of outcome.

Bootstrap passes this constructor-returned object through `commandFactory.create()`, which validates the shape and produces an immutable, deep-frozen `TeqFw_Cli_Dto_Command`. The component constructor is the single place where command identity, metadata, and behaviour coexist: the static descriptor in `package.json#teqfw.fw.cli.commands` provides catalogue metadata for help, parsing, and selection; the component provides runtime metadata and implementation.

`TeqFw_Cli_Api_Plugin` is the public contract for an optional CLI plugin component. Its implementation is the DI product identified by its package's optional `teqfw.fw.cli.plugin` declaration and has both methods:

- onStartup(): void | Promise<void> connects the plugin package to the running application after cfg has loaded;
- onShutdown(): void | Promise<void> releases that connection during shutdown.

The public source uses the JSDoc `@interface` annotation. The canonical implementation for new code is a function-form DI factory that returns the structural plugin value and declares `@returns {TeqFw_Cli_Api_Plugin}`. It obtains integration dependencies through `__deps__`, including any extension registry owned by another plugin. Class-form DI components remain supported for compatibility but are non-canonical for new code; a class implementation uses `@implements {TeqFw_Cli_Api_Plugin}`. The factory does not freeze its result: the DI Container applies postprocessing and wrappers and then hardens the resolved value. `onStartup` and `onShutdown` are the whole CLI plugin lifecycle; there are no separate initialize, activate, deactivate, or dispose phases. A plugin may configure an extension registry it receives but never configures or resolves through Container. See [execution-lifecycle.md](execution-lifecycle.md) for startup sequencing and [plugin-activation.md](plugin-activation.md) for the Bootstrap coordination contract.

For a new lifecycle component, use the naming convention `{NS}_Plugin_Lifecycle$` for its Dependency Specifier, `Plugin/Lifecycle.mjs` for its source path, and `{NS}_Plugin_Lifecycle` for its namespace. Here `{NS}` is the package's DI namespace prefix without the trailing underscore. This is a recommendation, not a metadata-validation rule: `Plugin` describes the component's CLI integration role and does not imply that it manages other plugins.
