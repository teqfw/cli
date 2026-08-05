# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260728`

Only the root host package.json may declare host-related settings such as teqfw.fw.cli.container.configurator, relative to its root. When present, the configurator receives applicationRoot and argv and may return additional namespace roots, ordered preprocessors, ordered postprocessors, and a logging flag. Its absence leaves the Container configured from package metadata. Namespace paths resolve against their publishing package. Do not log secrets, arbitrary configuration values, or raw command input.
