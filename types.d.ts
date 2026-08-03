type TeqFw_Cli_Process_Status = 0 | 1 | 2 | 130 | 143;
type TeqFw_Cli_Command_Lifetime = 'finite' | 'long-running';
type TeqFw_Cli_Command_Runtime = Readonly<{done: Promise<unknown>; stop(): void | Promise<void>}>;
type TeqFw_Cli_Manifest_Namespace = Readonly<{prefix: string; path: string; ext?: string}>;
type TeqFw_Cli_Manifest_Cli = Readonly<{container?: Readonly<{configurator?: string}>; command?: Readonly<{default?: string}>; commands?: ReadonlyArray<string>; lifecycle?: ReadonlyArray<string>}>;
type TeqFw_Cli_Manifest_Framework = Readonly<{di?: Readonly<{namespaces?: ReadonlyArray<TeqFw_Cli_Manifest_Namespace>}>; cli?: TeqFw_Cli_Manifest_Cli}>;
type TeqFw_Cli_Manifest_TeqFw = Readonly<{fw?: TeqFw_Cli_Manifest_Framework}>;
type TeqFw_Cli_Launch_Resolver = (identifier: string) => Promise<unknown>;
type TeqFw_Cli_Launch_Context = Readonly<{argv: ReadonlyArray<string>; cwd: string; applicationRoot: string; version: string; commandProviders: ReadonlyArray<string>; lifecycleProviders: ReadonlyArray<string>; defaultCommand?: string; resolve: TeqFw_Cli_Launch_Resolver}>;
type TeqFw_Cli_Api_Container_NamespaceRoot = Readonly<{prefix: string; target: string; defaultExt: string}>;
type TeqFw_Cli_Api_Container_Preprocessor = (dependency: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO;
type TeqFw_Cli_Api_Container_Postprocessor = (value: unknown, context: unknown) => unknown;
type TeqFw_Cli_Api_Container_Configurator_Configuration = Readonly<{namespaceRoots?: ReadonlyArray<TeqFw_Cli_Api_Container_NamespaceRoot>; preprocessors?: ReadonlyArray<TeqFw_Cli_Api_Container_Preprocessor>; postprocessors?: ReadonlyArray<TeqFw_Cli_Api_Container_Postprocessor>; logging?: boolean}>;
interface TeqFw_Cli_Api_Container_Configurator {
    configure(params: {applicationRoot: string; argv: string[]}): TeqFw_Cli_Api_Container_Configurator_Configuration | Promise<TeqFw_Cli_Api_Container_Configurator_Configuration>;
}
