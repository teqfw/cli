# Errors and Process Results

- Path: `ctx/docs/architecture/errors.md`
- Changed: `20260728`


Discovery, metadata, declared configurator, namespace, and Bootstrap failures return 1 and run no lifecycle hooks. A missing optional configurator is not a failure. Under fail-fast composition, the starter does not pre-check, classify, or enrich malformed startup declarations; the first native operation reports the failure. Usage failures return 2 before activation. Runtime and cleanup failures return 1 unless the first stop signal determines 130 for SIGINT or 143 for SIGTERM. Only `bin/teq.mjs` assigns process.exitCode.
