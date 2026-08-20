# Changelog

## [Unreleased]

- Start the npm `teq` symlink when it is launched from a `node:test` worker on
  Node.js releases where `import.meta.main` is false in that child process.
- Recommend the `{NS}_Plugin_Lifecycle$` name and `Plugin/Lifecycle.mjs` path
  for new CLI lifecycle components.
- Recommend function-form DI factories as the canonical implementation for new CLI lifecycle plugins; class-form components remain supported.
- Fail fast with migration guidance when any package declares the retired `teqfw.fw.cli.lifecycle` metadata; use the current CLI plugin contract instead.

## [2.2.0] - 2026-08-13

- Launch a metadata-declared TeqFW host package explicitly with `--host <package>` and an optional `--host-root <path>`.
- Resolve the selected host through the local application tree, the global npm location that hosts `teq`, and well-known global npm locations, without spawning child processes.
- Validate the explicit host manifest (package name, canonical `teqfw.fw.di.namespaces`, `@teqfw/cli` dependency) and require a command identifier in explicit-host mode.
- Keep command-owned tokens after the command identifier untouched and preserve local-first host discovery when `--host` is absent.

## [2.1.0] - 2026-08-07

- Load the standard CLI configuration before Bootstrap and plugin or command resolution.
- Expose the immutable runtime configuration snapshot through DI as `TeqFw_Cli_Config$`.
- Support host-provided pre-DI Container configuration through the documented `bootstrap/di-config.mjs` convention.
- Normalize dotenv selection and launch context while preserving the original `argv` for the host launch boundary.
- Raise the minimum supported production dependency versions to the current npm releases of `@teqfw/di`, `@teqfw/log`, and `@teqfw/cfg`.

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
