# CLI Plugin Lifecycle

- Path: `ctx/docs/architecture/plugin-activation.md`
- Changed: `20260807`

TeqFw_Cli_Api_Plugin has exactly two methods: onStartup() and onShutdown(). Both may complete synchronously or return a promise. Configuration is already loaded before the component is resolved.

Bootstrap coordinates this phase but does not own signal plumbing or the shutdown stack. It opens one private Host run before resolving the first plugin component. The run subscribes to signals, retains each component whose `onStartup` has completed, invokes `onShutdown` for that retained stack, and exposes parser selection and command execution. Bootstrap uses the run to start each component in dependency-first package order, then to select the command. Thus a startup failure before command selection still closes every successfully started component.

CLI plugin startup is distinct from Container composition: namespace registration makes modules resolvable and package discovery reads metadata. Bootstrap resolves each declared plugin after cfg loading. Components use ordinary DI dependencies, including typed configuration, and never receive Container, the resolution capability, or the Host run.

Only Bootstrap directly triggers the two runtime resolution classes: CLI plugin components during startup and one selected command. The Host run, plugin components, commands, and all other products receive concrete values and ordinary declared dependencies only. See [execution-lifecycle.md](execution-lifecycle.md) for shutdown ordering and signal handling.
