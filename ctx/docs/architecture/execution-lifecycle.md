# Execution Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.md`
- Changed: `20260728`


Host initializes and activates in deterministic forward order, executes one command, then deactivates activated participants and disposes initialized participants in reverse order. Initialization failure disposes completed initialization; activation failure also deactivates completed activation. The earliest operational failure is preserved while cleanup is best effort.

Finite execution settles before shutdown. Long-running execution waits for done; SIGINT or SIGTERM aborts the signal, calls stop, waits for completion, and triggers one shutdown. Repeated signals do not initiate another shutdown.
