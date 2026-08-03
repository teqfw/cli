# Execution Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.md`
- Changed: `20260803`


Bootstrap opens the Host session, builds static command descriptors, and resolves the optional plugin component declared by each participating package. It asks the session to start every resolved component in deterministic dependency-first package order. The session installs its one shutdown driver before the first startup callback and retains only successful callbacks. Only after all startup callbacks succeed does Bootstrap ask the session to select a descriptor and resolve that descriptor's one command product.

An informational selection prints help or version, creates no command product, closes the session, and returns status 0. A usage failure closes the session and returns 2. Startup, command-resolution, command, or shutdown failure closes the session and returns 1 unless the first stop signal wins.

Finite execution settles before session close. Long-running execution waits for done; SIGINT or SIGTERM aborts the shared signal, calls stop when a command has started, waits for completion, and triggers one close. The session calls `onShutdown` in reverse successful-startup order. Repeated signals do not initiate another shutdown.
