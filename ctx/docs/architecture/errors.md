# Errors and Process Results

- Path: `ctx/docs/architecture/errors.md`
- Changed: `20260807`

Discovery, metadata, declared configurator, namespace, and Bootstrap-resolution failures return 1 and run no CLI plugin methods. A missing optional configurator is not a failure. cfg Source loading occurs before plugin resolution; a Source failure returns 1 and runs no plugin hooks. Under fail-fast composition, the starter does not pre-check, classify, or enrich malformed startup declarations; the first native operation reports the failure. A plugin-component resolution or `onStartup` failure, command-resolution failure, runtime failure, or shutdown failure returns 1 unless the first stop signal determines 130 for SIGINT or 143 for SIGTERM. Information returns 0 after `onShutdown` completes for already started CLI plugin components; usage returns 2 after the same close. Only `bin/teq.mjs` assigns process.exitCode. See [execution-lifecycle.md](execution-lifecycle.md) for the lifecycle context in which these codes are assigned.
