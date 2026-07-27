# AI Orientation

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260727`

`@teqfw/cli` is the TeqFW Node.js application host, not merely a command framework. Read product documents first, then architecture, environment, and code. Compose validates runtime metadata and DI before hooks; Host executes the lifecycle and one command. Runtime plugins use explicit lifecycle providers. Do not add process termination, container service lookup, or alternative hosts.
