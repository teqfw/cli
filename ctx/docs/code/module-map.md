# Module Map

- Path: `ctx/docs/code/module-map.md`
- Changed: `20260728`


- bin/teq.mjs: self-contained universal starter and process boundary; requirements are in [teq-starter.md](teq-starter.md).
- src/Api/Container/Configurator.mjs: public optional host configurator contract.
- src/Bootstrap.mjs: Node.js-only post-composition discovery of CLI declarations and active provider assembly.
- src/Host.mjs: lifecycle, command lifetime, signals, and cleanup.
