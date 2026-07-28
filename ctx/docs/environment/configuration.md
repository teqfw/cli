# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260728`


The head package.json declares teqfw.fw.cli.container.configurator relative to its root. The configurator receives immutable startup information and may return ordered preprocessors and postprocessors only. Namespace paths resolve against their publishing package. Do not log secrets, arbitrary configuration values, or raw command input.
