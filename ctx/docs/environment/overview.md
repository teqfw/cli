# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260726`

## Runtime

The package supports Node.js 20 and newer in ESM applications.
It assumes standard Node filesystem, path, process, signals, `AbortController`, package installation layout, and executable shebang behavior.

## Installation

Applications install `@teqfw/cli`, a compatible `@teqfw/di` 2.x, Commander through the host dependency graph, and their feature packages.
Discovery reads the actual installed layout and supports nested, scoped, and hoisted runtime dependencies.

## Distribution

The npm archive contains only runtime sources, `bin/teq.mjs`, `types.d.ts`, README, CHANGELOG, and LICENSE.
Tests, fixtures, ADSM context, and development configuration stay outside the archive.

## Operational Assumptions

One invocation is one process execution and selects at most one command.
No network service, database, daemon, secret store, container platform, or persistent host state is required by the CLI package itself.
