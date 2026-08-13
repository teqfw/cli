# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260813`

@teqfw/di provides production package records and the configured Container; @teqfw/cfg provides the mandatory CLI startup configuration snapshot. `bin/teq.mjs` owns pre-Container composition and depends only on Node.js libraries plus `@teqfw/di`; it never imports package `src` code. Its only dynamic import loads an optional host configurator declared in the host manifest. Bootstrap receives the public Node.js `PackageRegistry` through declared DI dependencies and uses it only to inspect static package declarations after Container startup.

Explicit host selection resolves the selected host package root through Node.js filesystem walks of the local application tree, the global npm location that hosts the starter, and well-known global npm locations; it does not spawn child processes or invoke the npm CLI. The selected host graph is built by the same `PackageRegistry` and container as a physical host.

Runtime-config initialization and cfg loading order are defined in [container-configurator.md](container-configurator.md). The starter passes Bootstrap a private get-only resolution capability separately from launch facts; this is a CLI-platform exception, not a general service-locator facility. Bootstrap uses it only for declared CLI plugins and the selected command, and never passes it to runtime products. All `src` modules remain namespace-addressed and validator-compatible.
