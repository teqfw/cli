# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260728`


1. teq is the standard TeqFW process host.
2. Discovery walks from original cwd and requires a configurator declaration.
3. The head configurator lives under bootstrap, returns extensions, and never owns Container creation.
4. Metadata uses teqfw.fw and exact-name teqfw.pkg keys with broadcast visibility.
5. Namespaces and extensions precede Bootstrap resolution.
6. Explicit command, head default, then help is the selection precedence.
7. Finite and long-running lifetimes are structurally distinct.
8. Host owns one cooperative signal shutdown and earliest-error preservation.
