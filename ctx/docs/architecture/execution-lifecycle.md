# Execution And Lifecycle

- Path: `ctx/docs/architecture/execution-lifecycle.md`
- Changed: `20260726`

## Parsing

The adapter builds nested commands from descriptor paths, provides help/version, converts typed values, applies defaults, and rejects unknown or missing input before action execution.
Parser errors are usage outcomes.
The adapter returns parser-neutral data from actions and never decides process status.

## Runner

For each invocation the runner creates one AbortController and installs SIGINT/SIGTERM listeners through the signal adapter.
The first observed signal aborts with a signal-specific reason and records the corresponding status. The signal adapter holds an invocation-scoped keepalive handle until listeners are removed, preventing signal-only pending commands from ending as unsettled top-level awaits.

When parser action selects a command, the runner executes it inside `try/catch/finally`.
If cleanup exists, it runs exactly once in `finally` after successful or failed execution.
Listeners are always removed at invocation completion.

## Error Precedence

An execution failure is primary.
If cleanup then fails, the host reports both while retaining the execution failure for status mapping.
A cleanup-only failure is the primary operational failure.
Signal status takes precedence after interruption, even if cooperative command shutdown throws because of abort.

## Process Boundary

The runner returns a numeric status.
The binary assigns `process.exitCode`; neither runtime library modules nor commands call `process.exit()`.
Help/version finish without selecting a command and therefore have no command cleanup.
