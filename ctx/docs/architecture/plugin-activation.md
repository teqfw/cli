# CLI Plugin Lifecycle

- Path: `ctx/docs/architecture/plugin-activation.md`
- Changed: `20260803`

`TeqFw_Cli_Api_Plugin` is the public contract for an optional component that connects a TeqFW plugin package to a CLI application. It has exactly two methods: `onStartup()` and `onShutdown()`. Both may complete synchronously or return a promise. The component is distinct from the npm package: a package may declare one such component or none. Metadata discovery is described in [discovery.md](discovery.md); the contract shape is owned by [command-contract.md](command-contract.md).

Bootstrap coordinates this phase but does not own signal plumbing or the shutdown stack. It opens one private Host run before resolving the first plugin component. The run subscribes to signals, retains each component whose `onStartup` has completed, invokes `onShutdown` for that retained stack, and exposes parser selection and command execution. Bootstrap uses the run to start each component in dependency-first package order, then to select the command. Thus a startup failure before command selection still closes every successfully started component.

CLI plugin startup is distinct from Container composition: namespace registration merely makes modules resolvable, and package discovery merely reads metadata. Bootstrap reads every package record through `PackageRegistry` and resolves the optional `teqfw.fw.cli.plugin` identifier from each declaring package through its private resolution capability. A component uses ordinary DI dependencies to register or configure contributions in extension points owned by CLI or other plugins. It must not receive Container, the resolution capability, or the Host run.

Only Bootstrap directly triggers the two runtime resolution classes: CLI plugin components during startup and one selected command. The Host run, plugin components, commands, and all other products receive concrete values and ordinary declared dependencies only. See [execution-lifecycle.md](execution-lifecycle.md) for shutdown ordering and signal handling.
