# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260728`


bin/teq.mjs and launcher are bootstrap-layer Composition Root code. They may use direct imports. src/Bootstrap.mjs starts the composed application, src/Host.mjs controls lifecycle, DTOs validate command structure, and adapters isolate parser, IO, and signals.
