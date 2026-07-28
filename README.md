# @teqfw/cli

`@teqfw/cli` is the standard Node.js process host and composition root for TeqFW applications. It discovers runtime packages, configures DI, assembles plugins, controls their lifecycle, runs one selected operating mode, handles interruption, logs transitions, and returns a process result.

## Install and run

```bash
npm install @teqfw/cli
teq --help
teq serve
```

The host supports finite commands and long-running modes. `--help` and `--version` do not activate the application. Input supports command paths plus string, number, and boolean arguments/options; invalid input returns status `2`.

## Runtime metadata

Runtime packages declare namespaces and optional provider tokens. Only `dependencies` participate; development dependencies never do.

```json
{
  "teqfw": {
    "namespaces": [{"prefix": "Vendor_App_", "path": "./src", "ext": ".mjs"}],
    "providers": {
      "cli": ["Vendor_App_Cli_Provider$"],
      "lifecycle": ["Vendor_App_Lifecycle_Provider$"]
    },
    "instructions": {"vendor": {"mode": "example"}}
  }
}
```

A CLI provider exposes `getCommands()`. A lifecycle provider exposes `getLifecycleParticipants()`, returning ordered objects with a globally unique `id` and any of `initialize`, `activate`, `deactivate`, and `dispose`. The DI registry preserves other static `teqfw` instructions for their owning extension; CLI itself interprets only its provider declarations. Components receive feature dependencies through DI; they must not use the container as a service locator.

## Lifecycle

For a selected command the host performs:

```text
compose → initialize → activate → run → deactivate → dispose
```

Forward ordering follows dependency-first runtime-package traversal, metadata token order, and provider return order. Deactivation and disposal use reverse order. Failed initialization disposes initialized participants; failed activation deactivates activated participants then disposes initialized participants. Shutdown is best-effort and preserves the earliest operational failure. Command `cleanup()` remains optional and is only for resources owned by that command; it runs once before application deactivation.

The first `SIGINT` or `SIGTERM` aborts the command through its `AbortSignal`; the host then performs exactly one shutdown. Statuses are `0` success, `1` startup/operational/shutdown failure, `2` usage error, `130` SIGINT, and `143` SIGTERM. Library and plugin code must not call `process.exit()`; `bin/teq.mjs` alone assigns `process.exitCode`.

`@teqfw/log` supplies structured lifecycle records. Its reference writer emits host/plugin transition diagnostics; do not put secrets or arbitrary input in log metadata.

## Migration from 0.1.0

The previous external parsing and command-execution internals are removed. Public command descriptors remain parser-neutral; use the host lifecycle contract. Move application-wide startup/shutdown work from command `cleanup()` to lifecycle participants; retain `cleanup()` only for command-local handles.

## Development

```bash
npm test
npm run validate:esm
npm run validate:ctx
```
