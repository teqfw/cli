# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260727`

An operator runs a finite migration and receives a final status after the application is initialized, activated, executed, and released.

An operator runs `teq serve`; the HTTP plugin activates its listener, the command waits cooperatively, and SIGINT causes controlled shutdown.

A plugin developer adds a worker or scheduler through runtime metadata without creating another process host.

An application maintainer diagnoses deterministic host and plugin lifecycle records without exposing configuration secrets.
