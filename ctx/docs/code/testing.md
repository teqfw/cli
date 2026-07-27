# Testing

- Path: `ctx/docs/code/testing.md`
- Changed: `20260727`

Use `node:test`. Unit tests cover parser conversion, provider/participant validation, forward/reverse lifecycle ordering, activation rollback, error precedence, and signal status. Integration tests use the real DI container and metadata traversal to prove namespaces precede provider resolution and command/lifecycle coexistence. Acceptance tests spawn the executable for help, version, typed commands, usage errors, failures, lifecycle logs, and SIGINT.

Run `npm test`, then `npm run validate:esm` and `npm run validate:ctx` when their tools are available. Tests must use isolated temporary fixtures and no network or external services.
