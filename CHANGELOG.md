# Changelog

All notable changes to this project are documented here.

## Unreleased

- Redefined `@teqfw/cli` as the standard TeqFW Node.js application host and composition root.
- Added lifecycle-provider discovery and deterministic `initialize`, `activate`, `deactivate`, and `dispose` control with rollback.
- Added `@teqfw/log` lifecycle diagnostics and host-owned signal shutdown.
- Removed the previous external parser and command-execution component; added a small internal parser.
- Kept command `cleanup()` only for command-local resources before application deactivation.

## 0.1.0 - 2026-07-26

- Initial command-host release.
