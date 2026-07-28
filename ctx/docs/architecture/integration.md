# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260728`


@teqfw/di provides production package records and the configured Container. @teqfw/log is the platform lifecycle diagnostics contract; active applications make its namespace available through DI metadata. Launcher helpers may use direct Node imports before the component graph. src modules remain namespace-addressed and validator-compatible.
