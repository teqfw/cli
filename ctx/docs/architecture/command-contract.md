# Command Contract

- Path: `ctx/docs/architecture/command-contract.md`
- Changed: `20260726`

## Provider

A DI-resolved provider exposes `getCommands()` without arguments.
It returns a frozen ordered array.
Provider dependencies and command feature dependencies enter through `__deps__`; manual container lookup is forbidden.
An unresolved provider, wrong provider shape, thrown provider call, mutable list, or invalid command is a startup failure.

## Command

A descriptor has immutable `id`, non-empty `path`, `summary`, optional `description`, `arguments`, `options`, async `execute(context)`, and optional async `cleanup()`.
IDs and complete paths are unique.
Path segments and input names use simple parser-safe identifiers.

Arguments declare `name`, kind (`string`, `number`, or `boolean`), `required`, `variadic`, description, and optional default.
Options add optional one-character `short` and `repeatable`.
Required inputs cannot also declare defaults; a variadic argument must be last.
Boolean positional arguments are represented by explicit textual true/false values at the parser boundary.

## Factories

Factories accept plain data, validate it, create defensive copies, normalize omitted optional fields/default booleans, and deep-freeze the complete descriptor graph.
Function identity is retained.
Unsupported fields are ignored only when they cannot weaken validation; required contract fields are always checked.

## Execution Context

The host calls `execute({args, options, signal})`.
`args` and `options` are frozen plain objects keyed by descriptor names; `signal` is an `AbortSignal`.
The context never includes Commander or the DI container.
