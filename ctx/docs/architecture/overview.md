# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260727`

The process boundary builds `Bootstrap`; it configures every namespace from the runtime package graph before the first container resolution. Bootstrap resolves explicit command and lifecycle providers, validates their products through registries, and delegates the assembled application to `Host`.

Host owns `compose → initialize → activate → run → deactivate → dispose`. Compose is Bootstrap work and has no lifecycle hooks. The internal parser creates parser-neutral invocation data; command descriptors remain independent from parsing. `@teqfw/log` is the common diagnostics boundary.

Feature components are constructor-injected. They never receive the container as a service locator. HTTP, worker, and scheduler packages are lifecycle participants, not hosts.
