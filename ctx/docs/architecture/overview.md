# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260728`


`bin/teq.mjs` is the self-contained universal Composition Root. Its `launch` input may supply `applicationRoot`; otherwise it derives the root npm package from its mounted path `node_modules/@teqfw/cli/bin/teq.mjs`. It captures cwd and argv, builds production records, registers package namespaces, optionally loads the host `TeqFw_Cli_Api_Container_Configurator`, applies its instructions, and resolves TeqFw_Cli_Bootstrap$. All pre-Container work lives in this script. The starter follows fail-fast composition: it trusts startup inputs and lets the first native Node.js or Container operation fail; it does not validate, normalize, freeze, recover, or enrich startup-condition errors.

Bootstrap receives only launch facts. It uses the public Node.js `PackageRegistry` after Container startup to read the static package graph and assemble command and lifecycle providers; it reads the host default command from the host record. This registry use neither configures Container nor loads application providers. Host owns lifecycle and command lifetime: a finite handler settles and exits; a long-running service awaits cooperative stop. Composition is not a plugin hook.
