# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260813`

1. teq is the standard TeqFW process host.
2. The starter accepts an applicationRoot input or derives the root npm package from its physical location: a development checkout root with node_modules, otherwise the parent of the enclosing installed node_modules directory. Only that manifest supplies host-related declarations, and its configurator declaration is optional.
3. Only a host application may implement `TeqFw_Cli_Api_Container_Configurator`; when present, it returns partial Container instructions and never receives or creates a Container.
4. Metadata uses teqfw.fw and exact-name teqfw.pkg keys with broadcast visibility.
5. Namespaces and extensions precede Bootstrap resolution.
6. Explicit command, head default, then built-in help is the selection precedence. The built-in help accepts `help`, `--help`, and `-h`; built-in version accepts `version` and `--version` as its sole argument.
7. Finite handler and long-running service lifetimes are structurally distinct.
8. Host owns one cooperative signal shutdown and earliest-error preservation through a private run opened by Bootstrap before plugin startup.
9. Bootstrap receives launch facts and one private, get-only resolution capability from the Composition Root. It may use that capability only for metadata-declared `TeqFw_Cli_Api_Plugin` components and the selected command product. The capability and Container never enter a CLI plugin component, command, Host, or general runtime dependency; all of those use ordinary declared DI dependencies.
10. CLI reads static command descriptors before command selection but creates no command product until one descriptor is selected. It resolves every declared `TeqFw_Cli_Api_Plugin` component during application startup in deterministic dependency-first package order, calls `onStartup`, and reverses successful startup with `onShutdown` during shutdown.
11. A command `id` is its sole public identity and explicit CLI selector. Colon-separated identifiers such as `web:start` are passed as one command-line token; command paths and independent CLI aliases do not exist.
12. The CLI runtime depends on cfg and calls TeqFw_Cfg_Loader.load() exactly once after initializing TeqFw_Cli_Config$ and before resolving Bootstrap, plugins, or commands; its Source order and precedence follow [container-configurator.md](container-configurator.md).
13. Lifecycle plugins use parameterless onStartup() and onShutdown() hooks; typed configuration is consumed through ordinary DI dependencies.
14. The Composition Root initializes one immutable TeqFw_Cli_Config$ before cfg load and before Bootstrap, plugin, or command resolution. It contains computed applicationRoot, cwd, normalized argv, and dotenv selection facts; user cfg cannot override them.
15. Explicit host selection is an alternative to physical-path host derivation. `--host <package>` and optional `--host-root <path>` are launcher-global options consumed only before the command identifier; they select the host package root. The selected host must declare a dependency on `@teqfw/cli` and canonical `teqfw.fw.di.namespaces`, and its dependency closure is built exactly like a physical host. The original cwd is launch context only and never selects or shapes the host graph.
