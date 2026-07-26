# Errors And Exit Status

- Path: `ctx/docs/architecture/errors.md`
- Changed: `20260726`

## Taxonomy

Usage errors are operator-correctable parser/validation failures before execution.
Startup errors include package graph, namespace, provider metadata/resolution, and command registry failures.
Operational errors include command execution and cleanup failures.
Interrupt outcomes follow the first received supported signal.

## Mapping

- Success, help, and version: `0`.
- Startup or operational error: `1`.
- Usage or validation error: `2`.
- SIGINT: `130`.
- SIGTERM: `143`.

## Reporting

Help/version and command output use stdout.
Usage and operational diagnostics use stderr.
Errors have stable categories, but 0.1.0 does not promise exact full diagnostic wording as a public API.
Cleanup errors are reported even when secondary.
