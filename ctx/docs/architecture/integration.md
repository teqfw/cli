# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260803`


@teqfw/di provides production package records and the configured Container. `bin/teq.mjs` owns pre-Container composition and depends only on Node.js libraries plus `@teqfw/di`; it never imports package `src` code. Its only dynamic import loads an optional host configurator declared in the host manifest. Bootstrap receives the public Node.js `PackageRegistry` through declared DI dependencies and uses it only to inspect static package declarations after Container startup.

The starter passes Bootstrap a private get-only resolution capability separately from launch facts. This is a CLI-platform exception, not a general DI service-locator facility: Bootstrap uses it only to create declared `TeqFw_Cli_Api_Plugin` components and the selected command. Bootstrap never receives Container's builder operations, and it never passes the capability to a CLI plugin component, command, or Host. CLI plugin components integrate their plugin packages through ordinary DI dependencies. All `src` runtime modules remain namespace-addressed and validator-compatible.
