# Execution Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.md`
- Changed: `20260727`

## Host phases

`compose` discovers packages, validates declarations, configures namespace roots and DI, and resolves providers. It performs no plugin runtime activity.

`initialize` invokes available hooks in forward deterministic order and records only successful participants. `activate` does the same after initialization; an application is operational only when all required activation succeeds. `run` executes exactly one selected command with immutable args, options, and an `AbortSignal`.

`deactivate` invokes only successfully activated participants in reverse order. `dispose` invokes only successfully initialized participants in reverse order. Shutdown means these two phases together.

A command-local `cleanup()` remains supported solely for resources acquired by that command. It runs exactly once after command settlement and before deactivation; application-wide ownership belongs to lifecycle hooks.

The first SIGINT or SIGTERM aborts the signal and records status 130 or 143. The handler never invokes plugin cleanup itself; lifecycle control continues in the host flow.
