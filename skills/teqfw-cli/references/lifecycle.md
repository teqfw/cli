# Lifecycle

Declare one optional lifecycle component identifier under
`teqfw.fw.cli.plugin`. Its DI product implements the public
`TeqFw_Cli_Api_Plugin` contract:

```js
export default class Plugin {
    async onStartup() {
    }
    async onShutdown() {}
}
```

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
