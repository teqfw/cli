# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260726`

## Discover Available Commands

The application assembler launches the host.
The host traverses the real installed runtime graph, accepts declared providers, and presents a deterministic command set.
Malformed or ambiguous declarations stop startup instead of producing a partial CLI.

## Inspect The Interface

The operator requests `--help` or `--version`.
The host writes the requested information and returns success without executing or cleaning up a feature command.

## Execute A Command

The operator selects a command path and supplies typed arguments/options.
The host validates input before calling `execute({args, options, signal})`, exposes output through the configured IO boundary, and returns success when execution and cleanup complete.

## Handle Failure

Usage failures return status 2 without execution.
Startup and operational failures return status 1.
If execution and cleanup both fail, the execution failure remains primary while the cleanup failure is still reported.

## Interrupt Execution

SIGINT or SIGTERM aborts the command signal.
The host waits for command settlement and cleanup, then returns 130 or 143 respectively.

## Outcome Invariants

Exactly zero or one command executes per invocation.
Exactly one cleanup applies to the selected command.
Help/version and parsing failures do not trigger command cleanup.
