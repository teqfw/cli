# Lifecycle

Declare one optional lifecycle component identifier under
`teqfw.fw.cli.plugin`. Its DI product implements the public
`TeqFw_Cli_Api_Plugin` contract:

```js
// @ts-check

/**
 * @returns {TeqFw_Cli_Api_Plugin}
 */
export default function Plugin() {
    return {
        onStartup: async function () {
        },
        onShutdown: async function () {
        },
    };
}
```

Use this function-form DI factory for new lifecycle components. Its return value
expresses the structural plugin contract directly; declare injected values in
the module's `__deps__` export as usual. Class-form components remain supported
for compatibility, but are non-canonical for new code. A factory uses
`@returns {TeqFw_Cli_Api_Plugin}`; reserve `@implements` for a class.

Do not freeze the returned object. The DI Container applies postprocessors and
wrappers, then hardens the resolved value. Factory-level freezing is redundant
for normal DI resolution and can prevent later postprocessing.

There are no `initialize`, `activate`, `deactivate`, or `dispose` phases.
Bootstrap resolves each declared component and calls `onStartup()` in
dependency-first package order. The Host retains successful starts and calls
`onShutdown()` in reverse order during one shutdown. A startup failure rolls
back only components that started successfully.

All lifecycle components start before command selection. Help and version do
not create a command product, but close already started lifecycle components.
Finite commands settle before close. For a long-running command, SIGINT or
SIGTERM aborts the shared signal, calls `stop()`, waits for `done`, then closes.

Only the executable assigns `process.exitCode`: success and information return
`0`, usage errors `2`, ordinary failures `1`, and the first stop signal may
produce `130` (SIGINT) or `143` (SIGTERM). Do not set process status in a
plugin, command, configurator, or Host consumer.
