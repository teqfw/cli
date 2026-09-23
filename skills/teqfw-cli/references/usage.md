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

## Explicit Host Selection

A TeqFW package that declares `teqfw.fw.di.namespaces` and
`teqfw.fw.cli.commands` and depends on `@teqfw/cli` can be launched as an
explicit host by name:

```sh
teq --host @flancer32/skill-adsm-ctx adsm-ctx:validate .
```

`--host <package>` selects the host package. The optional `--host-root <path>`
pins its root; a relative path resolves against the original working directory,
and the manifest package name must equal `--host`. Host options are
launcher-global and must precede the command identifier; tokens after it are
command-owned and never reinterpreted by the launcher. Without `--host-root`,
the launcher resolves the host through the local application tree and the
global npm module locations. The selected host must declare canonical
`teqfw.fw.di.namespaces` and a dependency on `@teqfw/cli`; otherwise launch
fails with an actionable error. The host root becomes
`TeqFw_Cli_Config$.applicationRoot` and its configurator and `.env` apply,
while `cwd` remains the invocation directory, so command arguments stay
relative to the operator's working directory. Local-first discovery is
unchanged when `--host` is absent.

## Host Container Configurator

Only the host application may declare `teqfw.fw.cli.container.configurator`.
The recommended module path is `bootstrap/di-config.mjs`, relative to the host
root; include this file in the package `files`/publish configuration. Its
default export is a `Configurator` class implementing
`TeqFw_Cli_Api_Container_Configurator`. The convention is not
filesystem-driven: the CLI dynamically imports the manifest-declared path.
Name package contributions `{Package}ContainerConfigurator`; they may be
statically imported by the host, but never declare the host-only metadata
themselves.

The host manifest declares the one composition boundary:

```json
{
  "teqfw": {
    "fw": {
      "cli": {
        "container": {"configurator": "./bootstrap/di-config.mjs"}
      }
    }
  }
}
```

The minimal configurator is pre-Container code: it neither receives nor
constructs a Container. It may return empty declarative collections when the
host has no customization:

```js
// @ts-check

/**
 * @namespace Acme_Cli_Container_Configurator
 * @description Provides the host composition extension point.
 * @implements {TeqFw_Cli_Api_Container_Configurator}
 */
export default class Configurator {
    constructor() {
        /**
         * @param {TeqFw_Cli_Api_Container_Configurator_Params} params
         * @returns {TeqFw_Cli_Api_Container_Configurator_Configuration}
         */
        this.configure = function ({applicationRoot, argv}) {
            return {
                container: {
                    namespaces: [],
                    preprocessors: [],
                    postprocessors: [],
                },
                configuration: {sources: []},
            };
        };
    }
}
```

For multiple host-selected contributions, statically import each configured
class, invoke `configure({applicationRoot, argv})`, and merge the returned
collections in an explicit deterministic order.

All returned properties are optional. `container` is JSON-safe policy data that
the starter combines with the package namespace mappings before calling
`new Container(data)`. It may add `namespaces`, `preprocessors`,
`postprocessors`, an optional `hardener`, diagnostic `logging`, and
`introspection`. Its processor values are Dependency Identifiers, not callback
functions: DI materializes each producer once while locking the policy before
the first entry. A preprocessor producer returns this synchronous policy:

```js
/**
 * @param {TeqFw_Di_Dto_DepId} depId
 * @param {TeqFw_Di_Container_ResolutionContext} context
 * @returns {TeqFw_Di_Dto_DepId}
 */
export default function Preprocessor() {
    return function preprocessor(depId, context) {
        return context.parent === null ? depId : depId;
    };
}
```

`context` is immutable request provenance: the current `depId`, root request,
immediate `parent` (or `null` for the root), and root-to-current `stack`. The
configurator cannot provide Container mocks or callbacks. Contributions only
return declarative data; the host selects their static imports, order, and
merge policy. Host Sources are application defaults. CLI then appends the
application-root `.env` when present and `process.env`, so process.env has the highest
precedence. Use `--dotenv-file path/to/file.env` or `--dotenv-file=path/to/file.env` to
select an explicit dotenv file relative to the host root; the option is consumed by the launcher before command parsing. The configurator neither receives nor constructs the Container. CLI loads the final Source list exactly once, initializes the immutable `TeqFw_Cli_Config$` runtime component, and only then resolves Bootstrap or plugins. Runtime facts are separate from cfg and cannot be overridden by user configuration.

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

A command component constructor returns a plain object with `id`, `summary`,
`arguments`, `options`, and `lifetime`, plus its handler. Keep its identity and
input metadata aligned with the static manifest descriptor: the descriptor
drives help and parsing, while the command product is resolved afterwards and
the CLI does not cross-check the two.

Use `lifetime: 'finite'` with `async execute(context)`, or
`lifetime: 'long-running'` with `async start(context)` returning
`{done: Promise, stop(): void | Promise<void>}`. Both handlers receive a context with:

- `args` — parsed positional arguments keyed by the manifest argument names;
- `options` — parsed options keyed by the manifest option names;
- `signal` — the shared `AbortSignal`, aborted by SIGINT or SIGTERM;
- `launch` — `{applicationRoot, cwd, argv}` for this launch. `argv` has launcher
  `--host`/`--host-root` options removed when they precede the command id, and
  `--dotenv-file` options removed wherever supplied. Command-owned tokens remain;
  `cwd` stays the invocation directory even for an explicit host.

Arguments and options may be omitted or empty. Their `kind` is `string`,
`number`, or `boolean`; descriptors may set `required` or `defaultValue` (not
both).
Arguments additionally support a final `variadic` argument. Options may define
a one-character `short` alias or be `repeatable` (with an array default when a
default is supplied). Value-taking options accept `--name value` and
`--name=value`; a short alias is invoked as `-x`. A non-repeatable boolean
option may be used as a flag or supplied an explicit value (`true`, `false`,
`1`, or `0`); repeatable options take values. Parsed values, not raw
command-line tokens, are passed in the context.

An optional `cleanup()` function receives no arguments. The Host calls it after
the handler settles or throws; a cleanup failure makes the run fail unless a
signal status takes precedence. The package's ambient `types.d.ts` does not
currently declare this handler-context shape, so treat the contract above as
the runtime behavior and validate command integrations in the host project.

## Order Dotenv Configuration

The installed CLI package contributes `cfg:sort`, a finite maintenance command
for a valid dotenv file:

```sh
teq cfg:sort
teq cfg:sort .env.local --check
teq cfg:sort .env.local --dry-run
```

Without an argument, it targets `.env` in the host application root. An
explicit relative path is resolved from the original launch cwd. It orders
complete cfg keys by namespace and parameter, keeps non-cfg assignments first,
and preserves assignment syntax, values, duplicate keys, multi-line quoted
values, inline comments, and attached comments. It does not repair invalid
dotenv syntax: cfg loads the selected application configuration before command
resolution. `--check` does not write and exits with status 1 when ordering is
needed. `--dry-run` does not write and reports the pending rewrite without
printing configuration values.
