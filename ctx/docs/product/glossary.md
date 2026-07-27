# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260727`

- **Process**: the Node.js OS process running `teq`.
- **Host**: `@teqfw/cli`, the composition root and lifecycle controller.
- **Application**: host plus discovered TeqFW runtime plugins.
- **Lifecycle participant**: plugin object with one or more lifecycle hooks.
- **Command provider**: DI component that publishes command descriptors.
- **Runtime plugin**: a package such as HTTP, worker, or scheduler hosted by the application.
- **Operating mode**: command-selected behavior executed after activation.
- **Shutdown**: collective term for deactivation then disposal.
