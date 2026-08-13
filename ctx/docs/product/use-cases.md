# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260813`

An operator runs teq db:migrate as a finite handler application. An operator runs teq web:start as a service application until cooperative stop. An operator invokes teq from any working directory. An operator runs teq help to view available commands or teq version to print the host application version. An operator launches a globally installed TeqFW package's declared commands with teq --host <package> <command> [...] from any working directory. An application maintainer may declare a module containing declarative Container instructions in the host manifest. A plugin maintainer may declare one CLI plugin component when its integration must be ready before any application command is selected.
