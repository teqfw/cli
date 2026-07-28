# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260728`

Supported runtime is Node.js 20+ with ESM, the Git-pinned `@teqfw/di` package, and runtime `@teqfw/log`. An application installs `@teqfw/cli` and its runtime plugins as dependencies. It starts from its application root through the `teq` executable.

The host needs no network, external database, or global tool for composition. Long-running applications must keep their command active and respond to the provided abort signal.
