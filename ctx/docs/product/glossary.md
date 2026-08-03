# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260728`


- Host application: root npm package that assembles the runtime application.
- Application root: root directory of the host application, independent of the original cwd.
- Original cwd: process working directory retained in launch context.
- Composition Root: `bin/teq.mjs`, which controls process startup and exit status.
- Application configurator: optional host bootstrap code returning declarative DI extensions.
- Installed package: production package in the runtime graph.
- Active plugin: installed package contributing active CLI or lifecycle providers.
- Finite command: command that settles after execute.
- Long-running command: command with done and controlled stop.
- Handler application: application selected as a finite command and terminated after its work settles.
- Service application: application selected as a long-running command and stopped cooperatively.
