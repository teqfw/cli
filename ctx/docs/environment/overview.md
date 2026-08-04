# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260804`


Node.js 20+ ESM is supported. A host application installs @teqfw/cli and active packages as production dependencies. The teq binary may run from any working directory; direct execution, the npm-created node_modules/.bin/teq symlink launcher, and a PM2 process whose script is the physical teq file start it on all supported Node.js releases, including releases before import.meta.main. Controlled invocations such as tests may supply applicationRoot. Development dependencies are excluded from runtime discovery. jsconfig scopes project checking to bin, src, test, types.d.ts, and installed @teqfw packages; other node_modules packages remain outside the project include set.
