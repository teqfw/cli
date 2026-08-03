# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260803`


- bin/teq.mjs: self-contained universal starter and process boundary; requirements are in [teq-starter.md](teq-starter.md).
- src/Api/Container/Configurator.mjs: public optional host configurator contract.
- src/Api/Plugin.mjs: public JSDoc `@interface` `TeqFw_Cli_Api_Plugin` with `onStartup` and `onShutdown`; implementations declare `@implements`.
- src/Dto/Command/Descriptor.mjs: validates static command descriptors from package metadata.
- src/Bootstrap.mjs: reads static CLI metadata, opens a Host session, resolves and starts CLI plugin components through its private capability, and lazily resolves the selected command.
- src/Host.mjs: private session for selection, command lifetime, signals, reverse CLI-plugin shutdown, and process result coordination.
