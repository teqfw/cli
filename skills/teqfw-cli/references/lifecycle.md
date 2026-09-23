# Lifecycle

Declare one optional lifecycle component identifier under
`teqfw.fw.cli.plugin`. Its DI product implements the public
`TeqFw_Cli_Api_Plugin` contract:

## Naming Convention

For a new package-owned lifecycle component, use these names, replacing
`{PackageNamespace}` with the package's DI namespace prefix without its
trailing underscore:

- Dependency Specifier: `{PackageNamespace}_Cli_Plugin$`
- source path: `src/Cli/Plugin.mjs`
- namespace: `{PackageNamespace}_Cli_Plugin`

For example, register the component in its owning package manifest as follows:

```json
{
  "teqfw": {
    "fw": {
      "cli": {
        "plugin": "Example_App_Cli_Plugin$"
      }
    }
  }
}
```

`Plugin` describes this component's CLI integration role. It does not mean the
component manages other plugins. The convention is recommended for new code;
the CLI accepts any valid declared Dependency Specifier and resolves it from
the package metadata rather than from this path.

## Implementation

```js
// @ts-check

/**
 * @namespace Example_App_Cli_Plugin
 * @description Provides the package-owned CLI lifecycle integration.
 * @implements {TeqFw_Cli_Api_Plugin}
 */
export default class Plugin {
    constructor() {
        this.onStartup = async function () {};
        this.onShutdown = async function () {};
    }
}
```

Use this class form for the minimal conventional implementation. Declare
injected values in the module's `__deps__` export as usual. A function-form DI
factory returning `TeqFw_Cli_Api_Plugin` remains compatible; do not freeze its
returned object, because the DI Container applies postprocessors and wrappers
before hardening the resolved value.

There are no `initialize`, `activate`, `deactivate`, or `dispose` phases.
Bootstrap resolves each declared component and calls `onStartup()` in
dependency-first package order. The Host retains successful starts and calls
`onShutdown()` in reverse order during one shutdown. A startup failure rolls
back only components that started successfully.

All lifecycle components start before command selection. Help and version do
not create a command product, but close already started lifecycle components.
Finite commands settle before close. SIGINT and SIGTERM abort the command's
shared `signal`; finite commands must observe it themselves if they need
cooperative cancellation. When SIGINT or SIGTERM occurs after `start()` has
returned a long-running handle, the Host calls `stop()` and waits for `done`
before closing.

Current limitation: the Host awaits `start()` before it installs the waiter
that invokes `stop()`. If a signal arrives while an asynchronous `start()` is
still pending, it is visible through `context.signal`, but the later
long-running wait can miss the abort event and never call `stop()`. Keep startup
responsive; check the signal around awaited initialization, unwind partial
startup in `start()` when needed, and return or reject promptly. Do not rely on
`stop()` being called for a signal received before `start()` returns. This is a
runtime edge case, not a recommended lifecycle pattern.

Only the executable assigns `process.exitCode`: success and information return
`0`, usage errors `2`, ordinary failures `1`, and the first stop signal may
produce `130` (SIGINT) or `143` (SIGTERM). Do not set process status in a
plugin, command, configurator, or Host consumer.
