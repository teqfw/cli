# teq Starter

- Path: `ctx/docs/code/teq-starter.md`
- Changed: `20260807`

`bin/teq.mjs` is the package's self-contained physical process entry point and only Composition Root. It is a stable, universal starter for every TeqFW host application; change it only to correct a starter defect, not to add application behavior.

## Invocation Boundary

`launch({applicationRoot?, argv, cwd})` composes and starts an application. Controlled invocations, including integration tests, may supply `applicationRoot`. Otherwise the starter resolves its physical file. If that package root contains `node_modules`, it is a development checkout and becomes applicationRoot. Otherwise the starter ascends until it reaches the enclosing directory named `node_modules`; its parent is applicationRoot. `cwd` is retained as launch context and never selects the host application. The starter captures the Node.js composition environment through its native filesystem, path, and process dependencies; it does not read or pass an application version.

The physical-process guard first checks PM2's `pm_exec_path`: when its canonical path is this module, PM2's process container is an authorized launch context even though it imports the starter. Otherwise, it uses `import.meta.main` when the runtime exposes it. On supported Node.js releases that do not, it compares the canonical path of `process.argv[1]` with this module's canonical path; this recognizes both direct execution and the npm-generated `node_modules/.bin/teq` symlink launcher. When Node.js executes this file, it calls `launch` with `process.argv` and `process.cwd`, writes an unhandled startup error to stderr, and assigns `process.exitCode`. When another module imports `launch`, no process is started or exit code assigned. If canonical paths cannot be read, the guard remains false rather than accidentally starting an imported module.

## Composition Procedure

1. Read the host package manifest and build the production package registry from applicationRoot.
2. Create Container and register each package's `teqfw.fw.di.namespaces` roots.
3. Read only the host declaration for the optional Container configurator.
4. If declared, dynamically import the host configurator, construct its default export, and apply its namespace roots, preprocessors, postprocessors, logging instruction, and additional cfg Source declarations.
5. Resolve cfg and perform its one mandatory load, then resolve Bootstrap and start it with launch facts and a private get-only resolution capability. Preserve raw argv for the configurator and launch context; pass Bootstrap a separate argv with global `--dotenv-file` options removed.

The host package is the root npm package assembling the graph. Only its manifest may supply host declarations, including the optional configurator and default command. All package manifests may contribute package metadata, namespaces, command descriptors, and one optional CLI plugin component identifier. Package records are composition input only; the starter does not copy or expose a metadata registry. Bootstrap receives one immutable launch context containing argv, cwd, and applicationRoot and obtains PackageRegistry through its declared DI dependencies. Lifecycle hooks receive no launch parameters; configuration is available through DI before their products are resolved.

## Implementation Constraints

- Use static imports only from Node.js and public `@teqfw/di` exports.
- Do not import this package's `src` code or host runtime modules.
- The optional host configurator is the sole dynamic import and is resolved from its declared path relative to applicationRoot.
- A host configurator is pre-Container code and uses static imports only; it cannot rely on DI-resolved application modules.
- Do not split pre-Container work into helpers or other modules; all of it remains in this file.
- Do not create, resolve, or expose Container through the configurator; it only returns declarative instructions.
- Do not read or interpret command, CLI-plugin, lifecycle, or default-command declarations. Bootstrap reads static metadata after Container startup through `PackageRegistry`.
- Do not pass Container, package records, provider identifiers, or other Composition Root artifacts to Bootstrap. Pass only its private get-only capability separately from launch facts; Bootstrap must not forward it to any runtime product.
- Keep process lifetime, command selection, and lifecycle behavior in Bootstrap and Host after composition.

## Failure Model

Composition is fail-fast. The starter trusts startup parameters, manifests, and configurator instructions. It performs no structural checks, normalization, freezing, recovery, or error enrichment; the first relevant Node.js or Container operation fails naturally. A missing configurator declaration is normal. No Bootstrap resolution or lifecycle hook follows a composition failure.

## Verification

Integration tests import `launch` with an explicit applicationRoot and cover runs with and without a configurator. Acceptance tests execute the npm-style `node_modules/.bin/teq` launcher and run the source checkout directly; both must enter the starter on a Node.js release without `import.meta.main`. They emulate PM2's process container by importing the physical starter with its `pm_exec_path`; that invocation must start the configured script. They also cover a non-root cwd, command behavior, and cooperative SIGINT shutdown. The starter has no precondition-validation test matrix.
