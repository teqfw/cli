# Command and Lifecycle Contracts

- Path: `ctx/docs/architecture/command-contract.md`
- Changed: `20260727`

A command descriptor has id, path, summary, parser-neutral argument/option definitions, async `execute({args, options, signal})`, and optional command-local `cleanup()`. The internal parser supports required/default string, number, and boolean values, help, version, command-path selection, and stable usage errors. No parser object appears in the contract.

A lifecycle participant is `{id, initialize?, activate?, deactivate?, dispose?}`. Each hook is async-capable and receives `{signal}`. A participant may implement any subset, but must implement at least one hook. Hooks are not command hooks and a command provider need not be a lifecycle provider.
