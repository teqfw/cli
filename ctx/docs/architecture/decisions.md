# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260803`


1. teq is the standard TeqFW process host.
2. The starter accepts an applicationRoot input or, by default, derives the root npm package from its mounted node_modules path; only that manifest supplies host-related declarations, and its configurator declaration is optional.
3. Only a host application may implement `TeqFw_Cli_Api_Container_Configurator`; when present, it returns partial Container instructions and never receives or creates a Container.
4. Metadata uses teqfw.fw and exact-name teqfw.pkg keys with broadcast visibility.
5. Namespaces and extensions precede Bootstrap resolution.
6. Explicit command, head default, then help is the selection precedence.
7. Finite handler and long-running service lifetimes are structurally distinct.
8. Host owns one cooperative signal shutdown and earliest-error preservation through a private run opened by Bootstrap before plugin startup.
9. Bootstrap receives launch facts and one private, get-only resolution capability from the Composition Root. It may use that capability only for metadata-declared `TeqFw_Cli_Api_Plugin` components and the selected command product. The capability and Container never enter a CLI plugin component, command, Host, or general runtime dependency; all of those use ordinary declared DI dependencies.
10. CLI reads static command descriptors before command selection but creates no command product until one descriptor is selected. It resolves every declared `TeqFw_Cli_Api_Plugin` component during application startup in deterministic dependency-first package order, calls `onStartup`, and reverses successful startup with `onShutdown` during shutdown.
