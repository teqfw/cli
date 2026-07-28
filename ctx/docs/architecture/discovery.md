# Runtime Discovery

- Path: `ctx/docs/architecture/discovery.md`
- Changed: `20260728`

`TeqFw_Di_Node_Registry_Package` traverses the application root and installed transitive `dependencies` in deterministic dependency-first order; it excludes `devDependencies`, resolves scoped/hoisted packages, canonicalizes symlinks, rejects cycles, and returns immutable records with the complete frozen `packageJson`. `TeqFw_Di_Node_Registry_Namespace` derives and validates every TeqFW namespace before any `container.get()`.

CLI interprets ordered `teqfw.providers.cli` and `teqfw.providers.lifecycle` token arrays from those records. Other `teqfw` instructions remain immutable static metadata for their owning extension to interpret. Tokens must be valid CDC provider tokens and unique within a provider kind across the graph. CLI providers expose `getCommands()`; lifecycle providers expose `getLifecycleParticipants()`.

Lifecycle participant identities are non-empty, globally unique `id` values. Their provider order is dependency-first package order, then metadata order, then provider-return order. Duplicate declarations or malformed products fail composition.
