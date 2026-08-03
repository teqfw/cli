# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260803`


- Host application: root npm package that assembles the runtime application.
- Application root: root directory of the host application, independent of the original cwd.
- Original cwd: process working directory retained in launch context.
- Composition Root: `bin/teq.mjs`, which controls process startup and exit status.
- Application configurator: optional host bootstrap code returning declarative DI extensions.
- Installed package: production package in the runtime graph.
- TeqFW plugin package: an installed package with a DI namespace declaration; it may declare one CLI plugin component or none.
- CLI plugin component: a metadata-declared `TeqFw_Cli_Api_Plugin` product that connects a plugin package to the running application through ordinary DI dependencies.
- Command descriptor: static package metadata that identifies an invocable command and the DI component to create only when that command is selected.
- Finite command: command that settles after execute.
- Long-running command: command with done and controlled stop.
- Handler application: application selected as a finite command and terminated after its work settles.
- Service application: application selected as a long-running command and stopped cooperatively.
