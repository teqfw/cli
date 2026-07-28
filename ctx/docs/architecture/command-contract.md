# Command and Lifecycle Contracts

- Path: `ctx/docs/architecture/command-contract.md`
- Changed: `20260728`


A command has id, path, summary, inputs, and explicit lifetime. A finite command has lifetime finite and async execute(context). A long-running command has lifetime long-running and async start(context), returning {done: Promise, stop(): Promise or void}. Both receive parsed input, launch context, and AbortSignal.

Lifecycle participants have unique ids and optional initialize, activate, deactivate, and dispose hooks. Providers are active only through the CLI metadata protocol.
