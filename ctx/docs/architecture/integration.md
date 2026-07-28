# Integration Boundaries

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260728`

The Git-pinned `@teqfw/di` provides Node package and namespace registries plus constructor graph resolution. `@teqfw/log` provides `TeqFw_Log_Provider$`; Host and Bootstrap bind stable sources and emit structured records with phase, participant, hook, signal, status, and error where appropriate.

Node integration is limited to the executable, process signal adapter, filesystem/package discovery, and IO. The internal parser is intentionally small and has no third-party parser dependency. Libraries and plugins return control to Host rather than calling `process.exit()`.
