type TeqFw_Cli_Process_Status = 0 | 1 | 2 | 130 | 143;
type TeqFw_Cli_Command_Lifetime = 'finite' | 'long-running';
type TeqFw_Cli_Command_Runtime = Readonly<{done: Promise<unknown>; stop(): void | Promise<void>}>;
type TeqFw_Cli_Adapter_Io = import('./src/Adapter/Io.mjs').default;
type TeqFw_Cli_Adapter_Parser_Internal = import('./src/Adapter/Parser/Internal.mjs').default;
type TeqFw_Cli_Adapter_Signal = import('./src/Adapter/Signal.mjs').default;
type TeqFw_Cli_Dto_Argument = import('./src/Dto/Argument.mjs').default;
type TeqFw_Cli_Dto_Argument__Factory = import('./src/Dto/Argument.mjs').Factory;
type TeqFw_Cli_Dto_Command = import('./src/Dto/Command.mjs').default;
type TeqFw_Cli_Dto_Command__Factory = import('./src/Dto/Command.mjs').Factory;
type TeqFw_Cli_Dto_Command_Descriptor = import('./src/Dto/Command/Descriptor.mjs').default;
type TeqFw_Cli_Dto_Command_Descriptor__Factory = import('./src/Dto/Command/Descriptor.mjs').Factory;
type TeqFw_Cli_Dto_Option = import('./src/Dto/Option.mjs').default;
type TeqFw_Cli_Dto_Option__Factory = import('./src/Dto/Option.mjs').Factory;
type TeqFw_Cli_Host = import('./src/Host.mjs').default;
type TeqFw_Cli_Host_Open_Input = Readonly<{argv: ReadonlyArray<string>; version: string; commands: ReadonlyArray<TeqFw_Cli_Dto_Command_Descriptor>; defaultCommand: string | undefined; launch: TeqFw_Cli_Launch_Context}>;
type TeqFw_Cli_Registry_Command = import('./src/Registry/Command.mjs').default;
type TeqFw_Cli_Util_DeepFreeze = import('./src/Util/DeepFreeze.mjs').default;
type TeqFw_Cli_Api_Container_Configurator_Params = Readonly<{applicationRoot: string; argv: ReadonlyArray<string>}>;
type TeqFw_Cli_Manifest_Namespace = Readonly<{prefix: string; path: string; ext?: string}>;
type TeqFw_Cli_Manifest_Input_Value = string | number | boolean;
type TeqFw_Cli_Manifest_Argument = Readonly<{name: string; kind: 'string' | 'number' | 'boolean'; required?: boolean; variadic?: boolean; description: string; defaultValue?: TeqFw_Cli_Manifest_Input_Value}>;
type TeqFw_Cli_Manifest_Option = Readonly<{name: string; short?: string; kind: 'string' | 'number' | 'boolean'; required?: boolean; repeatable?: boolean; description: string; defaultValue?: TeqFw_Cli_Manifest_Input_Value | ReadonlyArray<TeqFw_Cli_Manifest_Input_Value>}>;
type TeqFw_Cli_Manifest_Command = Readonly<{id: string; summary: string; arguments?: ReadonlyArray<TeqFw_Cli_Manifest_Argument>; options?: ReadonlyArray<TeqFw_Cli_Manifest_Option>; component: string}>;
type TeqFw_Cli_Manifest_Cli = Readonly<{container?: Readonly<{configurator?: string}>; command?: Readonly<{default?: string}>; plugin?: string; commands?: ReadonlyArray<TeqFw_Cli_Manifest_Command>}>;
type TeqFw_Cli_Manifest_Framework = Readonly<{di?: Readonly<{namespaces?: ReadonlyArray<TeqFw_Cli_Manifest_Namespace>}>; cli?: TeqFw_Cli_Manifest_Cli}>;
type TeqFw_Cli_Manifest_TeqFw = Readonly<{fw?: TeqFw_Cli_Manifest_Framework}>;
type TeqFw_Cli_Bootstrap_Resolver = (identifier: string) => Promise<unknown>;
type TeqFw_Cli_Launch_Context = Readonly<{argv: ReadonlyArray<string>; cwd: string; applicationRoot: string}>;
type TeqFw_Cli_Host_Command_Selection = Readonly<{kind: 'command'; command: TeqFw_Cli_Dto_Command_Descriptor; args: Readonly<Record<string, unknown>>; options: Readonly<Record<string, unknown>>}>;
type TeqFw_Cli_Host_Selection = Readonly<{kind: 'information'}> | Readonly<{kind: 'interrupted'}> | Readonly<{kind: 'failure'; status: TeqFw_Cli_Process_Status}> | TeqFw_Cli_Host_Command_Selection;
type TeqFw_Cli_Host_Run = Readonly<{close(status?: TeqFw_Cli_Process_Status): Promise<TeqFw_Cli_Process_Status>; execute(selection: TeqFw_Cli_Host_Command_Selection, command: TeqFw_Cli_Dto_Command): Promise<void>; fail(error: unknown): void; isInterrupted(): boolean; select(): TeqFw_Cli_Host_Selection; start(plugin: TeqFw_Cli_Api_Plugin): Promise<void>}>;
type TeqFw_Cli_Node_Fs = typeof import('node:fs/promises');
type TeqFw_Cli_Node_Path = typeof import('node:path');
type TeqFw_Cli_Node_Package_Registry = new (deps: {fs: TeqFw_Cli_Node_Fs; path: TeqFw_Cli_Node_Path; appRoot: string}) => {build(): Promise<ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>>};
type TeqFw_Cli_Api_Container_NamespaceRoot = Readonly<{prefix: string; target: string; defaultExt: string}>;
type TeqFw_Cli_Api_Container_Preprocessor = (dependency: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId;
type TeqFw_Cli_Api_Container_Postprocessor = (value: unknown, context: unknown) => unknown;
type TeqFw_Cli_Api_Container_Configuration = Readonly<{sources?: ReadonlyArray<TeqFw_Cfg_Source>}>;
type TeqFw_Cli_Api_Container_Configurator_Configuration = Readonly<{namespaceRoots?: ReadonlyArray<TeqFw_Cli_Api_Container_NamespaceRoot>; preprocessors?: ReadonlyArray<TeqFw_Cli_Api_Container_Preprocessor>; postprocessors?: ReadonlyArray<TeqFw_Cli_Api_Container_Postprocessor>; logging?: boolean; configuration?: TeqFw_Cli_Api_Container_Configuration}>;
interface TeqFw_Cli_Api_Container_Configurator {
    configure(params: {applicationRoot: string; argv: ReadonlyArray<string>}): TeqFw_Cli_Api_Container_Configurator_Configuration | Promise<TeqFw_Cli_Api_Container_Configurator_Configuration>;
}
interface TeqFw_Cli_Api_Plugin {
    onStartup(): void | Promise<void>;
    onShutdown(): void | Promise<void>;
}
