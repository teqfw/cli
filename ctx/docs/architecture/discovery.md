# Discovery and Distributed Metadata

- Path: `ctx/docs/architecture/discovery.md`
- Changed: `20260728`


The DI package registry traverses only production dependencies in deterministic dependency-first order. Every manifest contributes immutable teqfw metadata. teqfw.fw contains framework protocols and teqfw.pkg uses exact npm names as keys.

teqfw.fw.di.namespaces contains package-relative namespace roots. Duplicate prefixes fail before resolution. teqfw.fw.cli.container.configurator and teqfw.fw.cli.command.default are accepted only from the head application. teqfw.fw.cli.commands and lifecycle collect active provider identifiers in package then declaration order.

Path ownership identifies schema owner and primary interpreter; all runtime participants can inspect all metadata. Protocols define authority, aggregation, override, conflict, and ordering rules.
