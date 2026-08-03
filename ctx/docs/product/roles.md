# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260728`


The OS invokes teq and the executable owns the exit code. The host application is the root npm package that assembles the runtime application; it owns the only manifest interpreted for host-related declarations and may provide a configurator. The CLI package owns generic composition and lifecycle. Plugin developers publish metadata and DI products. Operators choose commands without managing plugin order.
