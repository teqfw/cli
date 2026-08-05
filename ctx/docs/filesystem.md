# Repository Filesystem

- Path: `ctx/docs/filesystem.md`
- Changed: `20260803`

- bin: self-contained universal teq starter, physical process entry point, and package Composition Root.
- src: namespace-addressed runtime modules. Their logical TeqFW names are resolved by the configured Container from `teqfw.fw.di.namespaces`; they are not a direct JavaScript import API.
- ctx: authoritative ADSM cognitive context.
- test: unit, integration, acceptance fixtures and tests.
- README.md, CHANGELOG.md, package.json, types.d.ts: public package contract.

## Package Entry Points

The package's executable public entry point is `bin/teq.mjs`, published as the `teq` bin. The supported integration surface consists of the documented manifest declarations and ambient JSDoc types in `types.d.ts`; runtime products in `src/` are obtained through DI, not imported by consumers.

`package.json#exports` is a Node.js direct-import allowlist. It has no role in TeqFW namespace registration or Container resolution, which load published `src/` files through `teqfw.fw.di.namespaces`. Therefore `exports` must not expose internal runtime modules or be described as a way to obtain DI products. If direct JavaScript imports become an intentional supported API, document each entry point and its compatibility commitment; otherwise omit `exports`.
