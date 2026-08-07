# Usage

## Install and Launch

Add `@teqfw/cli` to the host application's production `dependencies`. Its npm
`bin` declaration creates `node_modules/.bin/teq`; npm package scripts resolve
that directory automatically:

```json
{
  "scripts": {
    "start": "teq web:start"
  }
}
```

Run `npm run start`. For a manual local check, use `npm exec -- teq help` or
`./node_modules/.bin/teq help`; `--help` remains supported. Do not require a
global installation, invoke
`bin/teq.mjs` by a package-internal path, or treat a transitive or development
dependency as the host runtime edge.

## Host Container Configurator

Only the host application may declare `teqfw.fw.cli.container.configurator`.
The recommended module path is `bootstrap/di-config.mjs`, relative to the host
root; include this file in the package `files`/publish configuration. Its
default-exported class
implements `TeqFw_Cli_Api_Container_Configurator` and provides:

```js
export default class Configurator {
    configure({applicationRoot, argv}) {
        return {
            namespaceRoots: [],
            preprocessors: [],
            postprocessors: [],
            logging: false,
            configuration: {
                sources: [{id: 'app-config', load: async () => [{key: 'APP__MODE', value: 'production'}]}],
            },
        };
    }
}
```

All returned properties are optional. The configurator may add namespace roots,
preprocessors, postprocessors, diagnostic logging, and ordered cfg Source descriptors
under configuration.sources. It neither receives nor constructs the Container. CLI
loads those Sources exactly once before resolving Bootstrap or plugins.

## Commands

Each package may contribute static descriptors under `teqfw.fw.cli.commands`:

```json
{
  "id": "web:start",
  "summary": "Start the web service.",
  "arguments": [],
  "options": [],
  "component": "Acme_Web_Cli_Command_Start$"
}
```

`id` is the command's sole public name: invoke this command as `teq web:start`.
`component` is a DI dependency identifier. The descriptor supplies help,
parsing, and selection data; it is not the command product. Only the host may
set `teqfw.fw.cli.command.default`, which selects a descriptor by `id` when no
explicit command was supplied.

A command component constructor returns a plain object with the same identity
and input metadata, plus `lifetime` and its handler. Use `lifetime: 'finite'`
with `async execute(context)`, or `lifetime: 'long-running'` with
`async start(context)` returning `{done, stop}`. An optional `cleanup` function
runs after command execution regardless of result.

Read the installed package's `types.d.ts` and tests before relying on an exact
input or handler shape.
