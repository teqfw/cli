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
The canonical module path is `bootstrap/di-config.mjs`, relative to the host
root; include this file in the package `files`/publish configuration. Its
default export is a `HostContainerConfigurator` class implementing
`TeqFw_Cli_Api_Container_Configurator`. Name package contributions
`{Package}ContainerConfigurator`; they may be statically imported by the host,
but never declare the host-only metadata themselves.

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

The following canonical implementation passes the same launch facts to every
contribution and merges their extensions in host-selected order:

```js
import FeatureContainerConfigurator from '@acme/feature/bootstrap/di-config';

const contributions = [FeatureContainerConfigurator];

/** @implements {TeqFw_Cli_Api_Container_Configurator} */
export default class HostContainerConfigurator {
    /**
     * @param {TeqFw_Cli_Api_Container_Configurator_Params} params
     * @returns {TeqFw_Cli_Api_Container_Configurator_Configuration}
     */
    async configure({applicationRoot, argv}) {
        const extensions = await Promise.all(contributions.map(
            (Contribution) => new Contribution().configure({applicationRoot, argv}),
        ));
        return extensions.reduce((merged, extension) => ({
            namespaceRoots: [...(merged.namespaceRoots ?? []), ...(extension.namespaceRoots ?? [])],
            preprocessors: [...(merged.preprocessors ?? []), ...(extension.preprocessors ?? [])],
            postprocessors: [...(merged.postprocessors ?? []), ...(extension.postprocessors ?? [])],
            logging: merged.logging || extension.logging,
            configuration: {
                sources: [...(merged.configuration?.sources ?? []), ...(extension.configuration?.sources ?? [])],
            },
        }), {
            namespaceRoots: [],
            preprocessors: [],
            postprocessors: [],
            logging: false,
            configuration: {sources: []},
        });
    }
}
```

All returned properties are optional. The configurator may add namespace roots,
preprocessors, postprocessors, diagnostic logging, and additional cfg Source descriptors
under configuration.sources. A preprocessor has this JSDoc contract:

```js
/**
 * @param {TeqFw_Di_Dto_DepId} depId
 * @param {TeqFw_Di_Container_ResolutionContext} context
 * @returns {TeqFw_Di_Dto_DepId}
 */
function preprocessor(depId, context) {
    return context.parent === null ? depId : depId;
}
```

`context` is immutable request provenance: the current `depId`, root request,
immediate `parent` (or `null` for the root), and root-to-current `stack`.
Contributions only return extensions; the host selects their static imports,
order, and merge policy. Host Sources are application defaults. CLI then appends the
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

A command component constructor returns a plain object with the same identity
and input metadata, plus `lifetime` and its handler. Use `lifetime: 'finite'`
with `async execute(context)`, or `lifetime: 'long-running'` with
`async start(context)` returning `{done, stop}`. An optional `cleanup` function
runs after command execution regardless of result.

Read the installed package's `types.d.ts` and tests before relying on an exact
input or handler shape.
