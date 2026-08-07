# Execution Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.md`
- Changed: `20260807`

The Composition Root loads cfg Sources exactly once before resolving Bootstrap. Bootstrap then builds static command descriptors from package metadata, opens the Host run, and resolves the optional plugin component declared by each participating package. It asks the run to start every resolved component in deterministic dependency-first package order, Each component may depend on typed configuration through DI because the cfg snapshot is ready before resolution. The run installs its one shutdown driver before the first startup callback and retains only successful callbacks. Only after all startup callbacks succeed does Bootstrap ask the run to select a descriptor and resolve that descriptor's one command product.

An informational selection prints help or version, creates no command product, closes the run, and returns status 0. Help accepts `help`, `--help`, or `-h`; version accepts `version` or `--version` as its sole argument. A usage failure closes the run and returns 2. Startup, command-resolution, command, or shutdown failure closes the run and returns 1 unless the first stop signal wins; see [errors.md](errors.md) for the complete exit code reference.

Finite execution settles before run close. Long-running execution waits for done; SIGINT or SIGTERM aborts the shared signal, calls stop when a command has started, waits for completion, and triggers one close. The run calls `onShutdown` in reverse successful-startup order. Repeated signals do not initiate another shutdown.
