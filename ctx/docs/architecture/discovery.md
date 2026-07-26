# Provider Discovery

- Path: `ctx/docs/architecture/discovery.md`
- Changed: `20260726`

## Package Graph

One traversal component starts at the real application root, reads each real installed package once, and follows sorted `dependencies` names only.
It resolves a dependency from the declaring package upward through `node_modules` until the application boundary, supporting scopes and hoisting.
Real paths provide cycle protection and package identity.
Missing installed dependencies and unreadable/invalid package metadata are startup failures.

## Namespace Registry

Bootstrap uses public `@teqfw/di/src/Config/NamespaceRegistry.mjs` with the application root.
All returned prefix/path/extension entries are added to the Container before its first `get()`.
The CLI package does not reproduce DI namespace validation.

## Provider Registry

For every package in deterministic graph order, read `teqfw.providers.cli`.
Absent metadata means no providers.
Present metadata must be an array of valid TeqFW CDC tokens.
Tokens are ordered first by package traversal and then by declaration order.
Duplicate tokens anywhere are startup failures.

## Prohibitions

Do not scan filenames, source directories, exports, or namespace names for commands.
Do not follow peer, optional, or development dependencies in 0.1.0.
Do not resolve providers while discovery/configuration is incomplete.
