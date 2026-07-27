# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260727`

`@teqfw/cli` is the standard process host and composition root for Node.js applications built from TeqFW plugins. It assembles an application, manages participating plugin lifecycle, selects an operating command, handles controlled shutdown, and reports a stable process outcome.

A command line is an operator interface, not the product identity. `teq serve`, `teq worker`, `teq migrate`, and `teq scheduler` select application operating modes. HTTP servers, workers, and schedulers remain runtime plugins hosted by the same application.

The product supports finite and long-running commands. Operators observe invocation, output, interruption, and exit status; they do not need lifecycle knowledge. The host never requires library or plugin code to terminate the process directly.

Stable externally visible behavior: explicit runtime-package discovery, DI assembly, phases `compose → initialize → activate → run → deactivate → dispose`, cooperative abort through `AbortSignal`, structured lifecycle diagnostics, and statuses 0, 1, 2, 130, and 143.
