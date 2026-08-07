# Host Container Configurator Contract

- Path: `ctx/docs/architecture/container-configurator.md`
- Changed: `20260807`

`TeqFw_Cli_Api_Container_Configurator` is an optional public bootstrap contract between `@teqfw/cli` and a host application. A host may declare its implementation module path, relative to the application root, in `teqfw.fw.cli.container.configurator`. When declared, bin/teq.mjs dynamically loads and constructs the default export before the first Container resolution, then invokes configure(). The configurator is not a Container-resolved component. When absent, the CLI still runs cfg with the standard application-root `.env` when present and process.env.
The Composition Root resolves TeqFw_Cli_Config$ once after namespace registration and DI extensions, initializes it from computed launch facts, then performs the mandatory cfg load. The component is immutable after initialization and is available to Bootstrap, plugins, and commands through ordinary DI. Its fields are applicationRoot, cwd, normalized argv, dotenvPath, and dotenvExplicit; raw argv remains in the configurator and launch context.

Keep the configurator in a bootstrap or config source area outside the published DI namespace tree. The recommended host layout is `bootstrap/di-config.mjs`; its declared path is a host package contract and must be included by the package files/publish configuration.

The configurator receives application root and process argv. It returns optional Container instructions and configuration.sources, an ordered array of additional public cfg Source descriptors. The CLI builds the final ordered list as host Sources (application defaults) -> the application `.env` -> process.env, omitting a missing default `.env`. An explicit `--dotenv-file <path>` or `--dotenv-file=<path>` selects a dotenv file relative to the application root and is required to exist. CLI passes the final Sources to TeqFw_Cfg_Loader.load() exactly once after runtime-config initialization and before resolving Bootstrap, plugins, or commands:

- `namespaceRoots`: additional `{prefix, target, defaultExt}` mappings;
- `preprocessors`: ordered dependency-identity transforms;
- `postprocessors`: ordered resolved-value transforms;
- configuration.sources: ordered additional TeqFw_Cfg_Source descriptors; absent means no host Sources. They precede the standard dotenv and process.env Sources, so dotenv overrides host defaults and process.env has the highest precedence.
- `logging`: whether Container diagnostic logging is enabled.

The starter trusts declared metadata and configurator instructions. It directly applies the supplied namespace roots, preprocessors, postprocessors, and logging to the newly created Container, builds the standard cfg Sources from applicationRoot and process.env, loads the complete ordered Source list, then resolves Bootstrap. It does not validate, normalize, recover, or enrich malformed input; it fails naturally in Node or Container. The first resolution locks the Container configuration.

Only the host application's configurator may provide these instructions. Plugins may publish their package namespace metadata and CLI contributions, but cannot configure Container roots, processors, logging, test mode, mocks, or the configurator itself. The contract never gives the application or a plugin the Container instance, and does not expose test-only `enableTestMode()` or `register()` operations.
