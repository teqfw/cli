# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260728`


Node.js 20+ ESM is supported. A host application installs @teqfw/cli and active packages as production dependencies. The teq binary may run from any working directory; controlled invocations such as tests may supply applicationRoot. Development dependencies are excluded from runtime discovery. jsconfig scopes project checking to bin, src, test, types.d.ts, and installed @teqfw packages; other node_modules packages remain outside the project include set.
