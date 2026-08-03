# AI Orientation

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260728`


@teqfw/cli is the TeqFW application launcher. Read product, architecture, environment, then code. Keep `bin/teq.mjs` as the self-contained physical process boundary and only Composition Root; all pre-Container work belongs there. Keep namespace-addressed runtime code in `src`; the optional host configurator is a host module declared in its manifest. Do not reintroduce retired metadata paths or allow components to call process.exit.
