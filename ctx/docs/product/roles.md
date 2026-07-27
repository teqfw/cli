# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260727`

- The Node.js process invokes `teq` and owns the OS exit code.
- The application host composes, controls lifecycle, selects a mode, and reports an outcome.
- The assembled TeqFW application is the host plus its discovered runtime plugins.
- Plugin developers publish command and lifecycle providers and implement cooperative behavior.
- Command providers publish mode descriptors; lifecycle providers publish application participants.
- Operators invoke a command and observe output/status without managing plugin order.
