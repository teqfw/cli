# @teqfw/cli

![npms.io](https://img.shields.io/npm/dm/@teqfw/cli)

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/cli` is the standard Node.js process host for TeqFW applications: a single `teq` executable builds the application runtime, starts declared components, selects a command, and coordinates its execution and shutdown. It is part of the Tequila Framework (TeqFW): created and evolved by coding agents under the architectural direction and final responsibility of [Alex Gusev](https://github.com/flancer64), and shipped with a version-matched Agent Skill so other agents can understand, integrate, and use it correctly.

## Why use it

> **A TeqFW application needs one place where its runtime graph is composed, its commands are selected, and its process lifecycle is governed.**

`bin/teq.mjs` is the self-contained Composition Root of every TeqFW application. It establishes the host application root independently of the original working directory, builds the production package graph, registers published DI namespace roots, optionally applies the host Container configurator, and resolves Bootstrap. Bootstrap reads static package metadata, starts declared CLI plugin components in deterministic order, selects a command, and resolves only that command.

That enables:

- one process host for HTTP services, workers, schedulers, migrations, and maintenance commands;
- commands declared as static metadata in package manifests instead of hard-coded entry points;
- finite commands (`execute`) and long-running services (`start`) with cooperative signal shutdown;
- deterministic plugin startup and reverse shutdown rollback;
- the same launcher on direct execution, the npm `teq` symlink, and PM2.

## Quick Start

Install `@teqfw/cli` as a production dependency of the host application:

```sh
npm i @teqfw/cli
```

The package publishes the `teq` binary; npm exposes it at `node_modules/.bin/teq` and adds that directory to script `PATH`:

```json
{
  "scripts": {
    "start": "teq web:start",
    "migrate": "teq db:migrate"
  }
}
```

Run `npm run start` or `npm run migrate`. For an explicit local invocation use `npm exec -- teq help`; `--help` and `-h` remain supported. Use `teq version` (or `teq --version`) to print the host application version. A global install is not required.

Under PM2, point the process at the physical launcher script; the launcher recognizes PM2's process container and starts the application:

```js
module.exports = {
  apps: [{
    name: 'host-app',
    script: './node_modules/@teqfw/cli/bin/teq.mjs',
    args: 'web:start',
  }],
};
```

## Best fit

Use `@teqfw/cli` when you build a TeqFW application and want a standard, metadata-driven launcher instead of a hand-written entry script. It fits applications assembled from DI packages whose operations are exposed as declared CLI commands: web services, workers, schedulers, migrations, and maintenance commands in one process.

## Boundaries

- The `teq` executable owns the process exit code; plugins and commands never call `process.exit`.
- Only the host application may declare the Container configurator or the default command; plugins never create or configure a Container.
- Runtime modules in `src/` are DI-addressed, not a direct JavaScript import API.
- Detailed contracts and integration rules live in the package's Agent Skill, not in this README.

## Agent-Driven Development

TeqFW is built through the same development model that it is designed to enable: one human defines the intent, architecture, constraints, and acceptance criteria; coding agents implement and maintain the products; other agents use those products in different combinations to create applications.

`@teqfw/cli` is part of the Tequila Framework (TeqFW). The package includes a version-matched Agent Skill in `skills/teqfw-cli`. The README provides a human-facing product overview; the skill provides agents with the package concepts, contracts, integration rules, examples, and boundaries.

Mount the skill into a host project:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/cli/skills/teqfw-cli \
  .agents/skills/teqfw-cli
```

Each TeqFW package is both a practical software component and a working demonstration of human-governed, agent-driven development. This work follows the Agent-Driven Software Management (ADSM) approach: human intent, architectural authority, acceptance, and responsibility remain authoritative; agents act as implementation and reasoning partners.

- [Tequila Framework](https://teqfw.com/?from=github-teqfw-cli)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?from=github-teqfw-cli)
- [Alex Gusev](https://github.com/flancer64)
