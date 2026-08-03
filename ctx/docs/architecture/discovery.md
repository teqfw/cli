# Discovery and Distributed Metadata

- Path: `ctx/docs/architecture/discovery.md`
- Changed: `20260728`


The DI package registry traverses only production dependencies in deterministic dependency-first order. The starter uses a supplied applicationRoot when present; otherwise it derives the root npm package that assembles this graph from its mounted path `node_modules/@teqfw/cli/bin/teq.mjs`. That package is the host application. Every manifest contributes teqfw metadata. teqfw.fw contains framework protocols and teqfw.pkg uses exact npm names as keys.

teqfw.fw.di.namespaces contains package-relative namespace roots. The starter interprets only the host application's teqfw.fw.cli.container.configurator declaration while configuring Container. The configurator declaration is optional and is not itself the host-discovery criterion. After Container startup, Bootstrap uses `PackageRegistry` to interpret teqfw.fw.cli.commands and lifecycle declarations in package then declaration order, and the host-only teqfw.fw.cli.command.default declaration. PackageRegistry reads immutable static metadata only; it does not configure Container or load providers. The starter and Bootstrap trust declaration shape and let malformed metadata fail at its native use site.

Path ownership identifies schema owner and primary interpreter; all runtime participants can inspect all metadata. Protocols define authority, aggregation, override, conflict, and ordering rules.
