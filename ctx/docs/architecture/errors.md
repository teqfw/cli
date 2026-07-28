# Errors and Process Results

- Path: `ctx/docs/architecture/errors.md`
- Changed: `20260728`


Discovery, metadata, configurator, namespace, and Bootstrap failures return 1 and run no lifecycle hooks. Usage failures return 2 before activation. Runtime and cleanup failures return 1 unless the first stop signal determines 130 for SIGINT or 143 for SIGTERM. Only the executable assigns process.exitCode.
