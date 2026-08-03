# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260803`


`bin/teq.mjs` is the self-contained universal Composition Root. Its `launch` input may supply `applicationRoot`; otherwise it derives the root npm package from its mounted path `node_modules/@teqfw/cli/bin/teq.mjs`. It captures cwd and argv, builds production records, registers package namespaces, optionally loads the host `TeqFw_Cli_Api_Container_Configurator`, applies its instructions, and resolves TeqFw_Cli_Bootstrap$. All pre-Container work lives in this script. The starter follows fail-fast composition: it trusts startup inputs and lets the first native Node.js or Container operation fail; it does not validate, normalize, freeze, recover, or enrich startup-condition errors.

Bootstrap receives launch facts and the starter's private resolution capability. Through its declared `PackageRegistry` dependency it reads the static package graph, builds a command catalogue, discovers CLI plugin component identifiers, and reads the host default command. Discovery creates no command or plugin component. Bootstrap opens a Host run, uses its private capability only to resolve every declared `TeqFw_Cli_Api_Plugin` component in deterministic order and, after successful startup and command selection, the selected command. It passes concrete products, never the capability or Container, to that run. Host controls command lifetime, signals, rollback, and shutdown: a finite handler settles and exits; a long-running service awaits cooperative stop. Composition is not a plugin hook.
