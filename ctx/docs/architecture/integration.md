# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260728`


@teqfw/di provides production package records and the configured Container. `bin/teq.mjs` owns pre-Container composition and depends only on Node.js libraries plus `@teqfw/di`; it never imports package `src` code. Its only dynamic import loads an optional host configurator declared in the host manifest. `src/Bootstrap.mjs` is a Node.js-only runtime component and may use the public `@teqfw/di/node/registry/package` export to read static package declarations after Container startup. It must not use that registry to configure or resolve through Container. All `src` runtime modules remain namespace-addressed and validator-compatible.
