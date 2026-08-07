# Concepts

`@teqfw/cli` provides the `teq` executable, the Node.js Composition Root for a
TeqFW application. It builds the production package graph, registers published
DI namespace roots, applies optional host configuration, then loads host defaults, the application `.env` when present, and process.env before resolving
Bootstrap.

The host application is the root package assembled by the executable. It owns
application composition. A package that contributes a command or a lifecycle
component does not become a host and must not configure the Container.

## Metadata and Resolution

Use `teqfw.fw.cli` metadata in `package.json`:

- `container.configurator` — optional host-only module path, relative to the
  host root;
- `command.default` — optional host-only command id;
- `commands` — package-owned array of static command descriptors;
- `plugin` — optional dependency identifier of one lifecycle component.

Package discovery and namespace registration make declarations and modules
available, but do not instantiate them. Bootstrap starts declared lifecycle
components in production dependency-first package order, then resolves only the
selected command product.

The private resolver passed from the Composition Root belongs to Bootstrap. It
is not a general DI capability and must never enter a command, lifecycle
component, or Host run.
