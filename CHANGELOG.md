# Changelog

## [2.0.0] - 2026-08-05

Initial release as the standard Node.js process host for TeqFW applications.

- Start the `teq` entry point on Node.js 20 and early Node.js 22 releases that do not expose `import.meta.main`.
- Accept `help` and `version` as bare aliases for the built-in informational commands.
- Allow commands without inputs to omit `arguments` and `options` in static metadata and runtime products.
- Rebuilt teq as the TeqFW application Composition Root.
- Replaced the retired metadata layout with teqfw.fw and teqfw.pkg protocols.
- Added head discovery, bootstrap configurators, immutable launch context, and pre-resolution Container configuration.
- Added structural finite and long-running command lifetimes with controlled signal shutdown.
- Removed the obsolete provider registry and stale tests.
