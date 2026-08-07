# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260807`

Only the root host package.json may declare host-related settings such as teqfw.fw.cli.container.configurator, relative to the application root. The configurator receives applicationRoot and argv and may return namespace roots, ordered preprocessors, ordered postprocessors, logging, and ordered cfg Source descriptors. CLI loads those Sources once; when absent it calls cfg Loader with an empty list. The configurator is pre-DI and must not rely on DI or load cfg itself. Namespace paths resolve against their publishing package. Do not log secrets, arbitrary configuration values, or raw command input.
