# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260803`


The OS invokes teq and the executable owns the exit code. The host application is the root npm package that assembles the runtime application; it owns the only manifest interpreted for host-related declarations and may provide a configurator. The CLI package owns generic composition, plugin startup, command resolution, and shutdown. Plugin developers may publish static command descriptors and one optional CLI plugin declaration alongside DI products; its `TeqFw_Cli_Api_Plugin` component integrates the plugin package through declared dependencies, never through direct Container access. Operators choose commands without managing plugin order.
