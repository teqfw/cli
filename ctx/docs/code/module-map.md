# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260803`


- bin/teq.mjs: self-contained universal starter and process boundary; requirements are in [teq-starter.md](teq-starter.md).
- src/Api/Container/Configurator.mjs: namespace-addressed optional host configurator contract; consumers use its ambient JSDoc type, not a direct module import.
- src/Api/Plugin.mjs: namespace-addressed JSDoc `@interface` `TeqFw_Cli_Api_Plugin` with `onStartup` and `onShutdown`; implementations declare `@implements`.
- src/Dto/Command/Descriptor.mjs: validates static command descriptors from package metadata.
- src/Bootstrap.mjs: reads static CLI metadata and the host application version, opens a Host run, resolves and starts CLI plugin components through its private capability, and lazily resolves the selected command.
- src/Adapter/Parser/Internal.mjs: maps built-in `help`/`--help`/`-h` and `version`/`--version` inputs plus selected-command arguments to parser-neutral selections.
- src/Host.mjs: private run for selection, command lifetime, signals, reverse CLI-plugin shutdown, and process result coordination.
