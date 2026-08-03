# Host Container Configurator Contract

- Path: `ctx/docs/architecture/container-configurator.md`
- Changed: `20260801`

`TeqFw_Cli_Api_Container_Configurator` is an optional public bootstrap contract between `@teqfw/cli` and a host application. A host may declare its implementation module path, relative to the application root, in `teqfw.fw.cli.container.configurator`. When declared, `bin/teq.mjs` directly loads and constructs the module's default export, then invokes its `configure()` method before creating or resolving application components; the configurator is not a Container-resolved component. When absent, `bin/teq.mjs` configures the Container from package metadata alone.

The configurator receives application root and process argv. Application root is the supplied starter input or, by default, the value derived from the mounted starter path; cwd remains a launch-context fact for commands. The configurator returns an object, or a promise of an object, with any of these optional instructions:

- `namespaceRoots`: additional `{prefix, target, defaultExt}` mappings;
- `preprocessors`: ordered dependency-identity transforms;
- `postprocessors`: ordered resolved-value transforms;
- `logging`: whether Container diagnostic logging is enabled.

The starter trusts declared metadata and configurator instructions. It directly applies the supplied namespace roots, preprocessors, postprocessors, and logging to the newly created Container, then resolves Bootstrap. It does not validate, normalize, freeze, recover, or enrich malformed input; it fails naturally in Node or Container. The first resolution locks the Container configuration.

Only the host application's configurator may provide these instructions. Plugins may publish their package namespace metadata and CLI contributions, but cannot configure Container roots, processors, logging, test mode, mocks, or the configurator itself. The contract never gives the application or a plugin the Container instance, and does not expose test-only `enableTestMode()` or `register()` operations.
