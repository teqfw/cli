# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260727`

1. `@teqfw/cli` is the standard Node.js process host; runtime packages do not create alternative hosts.
2. Host phases and plugin hooks are separate: compose does no hooks; lifecycle hooks are initialize/activate/deactivate/dispose.
3. Explicit `teqfw.providers.lifecycle` complements compatible `providers.cli` metadata.
4. Package traversal, declaration order, and provider order determine forward order; completed work reverses for shutdown.
5. Partial startup rolls back eligible completed work; shutdown is best-effort and preserves the earliest primary failure.
6. Host alone owns SIGINT/SIGTERM cancellation and one shutdown sequence.
7. Commands execute only after activation and settle before deactivation.
8. `cleanup()` is retained only for command-local resources and runs once before deactivation.
9. The external parser dependency is removed; a limited internal parser preserves parser-neutral descriptors.
10. `@teqfw/log` is the runtime diagnostics contract.
11. Host returns a status; the executable alone assigns the process exit code.
