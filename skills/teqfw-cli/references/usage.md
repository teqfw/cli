# Usage

## Host Container Configurator

Only the host application may declare `teqfw.fw.cli.container.configurator`.
Its value is a module path relative to the host root. Its default-exported class
implements `TeqFw_Cli_Api_Container_Configurator` and provides:

```js
export default class Configurator {
    configure({applicationRoot, argv}) {
        return {
            namespaceRoots: [],
            preprocessors: [],
            postprocessors: [],
            logging: false,
        };
    }
}
```

All returned properties are optional. The configurator may add namespace roots,
preprocessors, postprocessors, and diagnostic logging. It neither receives nor
constructs the Container; configuration is locked by the first resolution.

## Commands

Each package may contribute static descriptors under `teqfw.fw.cli.commands`:

```json
{
  "id": "web:start",
  "path": ["web", "start"],
  "summary": "Start the web service.",
  "arguments": [],
  "options": [],
  "component": "Acme_Web_Cli_Command_Start$"
}
```

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
