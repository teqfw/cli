# Errors and Process Results

- Path: `ctx/docs/architecture/errors.md`
- Changed: `20260727`

Composition failure returns 1 and invokes no lifecycle hook. Initialization failure disposes initialized participants; activation failure deactivates activated participants and disposes initialized participants; neither runs a command.

Command failure is the primary operational error. Command cleanup and shutdown continue; later cleanup/deactivation/disposal failures are logged and cannot replace an earlier primary error. If shutdown is the first failure it returns 1. Shutdown always attempts remaining eligible participants.

Usage failure returns 2 before lifecycle activity. First SIGINT returns 130; first SIGTERM returns 143. Only the executable assigns `process.exitCode`.
