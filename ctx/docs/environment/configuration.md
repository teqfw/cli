# Environment Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260813`

Only the root host package.json may declare host-related settings such as teqfw.fw.cli.container.configurator, relative to the application root. The configurator receives applicationRoot and argv and may return namespace roots, ordered preprocessors, ordered postprocessors, logging, and additional ordered cfg Source descriptors. CLI loads host Sources followed by the application-root `.env` and `process.env` exactly once. A missing default `.env` is ignored; `--dotenv-file <path>` or `--dotenv-file=<path>` selects an explicit path relative to applicationRoot and missing or invalid explicit files fail startup. Host Sources are defaults, dotenv overrides them, and process.env overrides both. The configurator is pre-DI and must not rely on DI or load cfg itself. Runtime-config fields and ordering are defined in [container-configurator.md](../architecture/container-configurator.md) and cannot be overridden by cfg. Namespace paths resolve against their publishing package. Do not log secrets, arbitrary configuration values, or raw command input.

In explicit host selection, the application root is the selected host package root: its configurator, `.env`, and explicit dotenv path apply to that root, while the original working directory is retained as the launch `cwd` fact. Runtime-config and Source ordering do not change.
