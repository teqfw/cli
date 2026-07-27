# Runtime Discovery

- Path: `ctx/docs/architecture/discovery.md`
- Changed: `20260727`

PackageGraph traverses the root package and installed transitive `dependencies` deterministically; it excludes `devDependencies`. NamespaceRegistry validates and registers every TeqFW namespace before any `container.get()`.

Each package may declare ordered `teqfw.providers.cli` and `teqfw.providers.lifecycle` token arrays. Tokens must be valid CDC provider tokens and unique within a provider kind across the graph. CLI providers expose `getCommands()`; lifecycle providers expose `getLifecycleParticipants()`.

Lifecycle participant identities are non-empty, globally unique `id` values. Their provider order is the package traversal order, then metadata order, then provider-return order. Duplicate declarations or malformed products fail composition.
