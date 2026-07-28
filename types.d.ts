type TeqFw_Cli_Value_Kind = 'string' | 'number' | 'boolean';
type TeqFw_Cli_Value = string | number | boolean;
type TeqFw_Cli_Process_Status = 0 | 1 | 2 | 130 | 143;
type TeqFw_Cli_Provider_Kind = 'cli' | 'lifecycle';

type TeqFw_Cli_Dto_Argument = Readonly<{
    name: string;
    kind: TeqFw_Cli_Value_Kind;
    required: boolean;
    variadic: boolean;
    description: string;
    defaultValue?: TeqFw_Cli_Value;
}>;
type TeqFw_Cli_Dto_Option = Readonly<{
    name: string;
    short?: string;
    kind: TeqFw_Cli_Value_Kind;
    required: boolean;
    repeatable: boolean;
    description: string;
    defaultValue?: TeqFw_Cli_Value | ReadonlyArray<TeqFw_Cli_Value>;
}>;
type TeqFw_Cli_Command_Context = Readonly<{
    args: Readonly<Record<string, unknown>>;
    options: Readonly<Record<string, unknown>>;
    signal: AbortSignal;
}>;
type TeqFw_Cli_Dto_Command = Readonly<{
    id: string;
    path: ReadonlyArray<string>;
    summary: string;
    description?: string;
    arguments: ReadonlyArray<TeqFw_Cli_Dto_Argument>;
    options: ReadonlyArray<TeqFw_Cli_Dto_Option>;
    execute(context: TeqFw_Cli_Command_Context): Promise<unknown>;
    cleanup?: () => void | Promise<void>;
}>;

type TeqFw_Cli_Api_Provider = Readonly<{
    getCommands(): ReadonlyArray<TeqFw_Cli_Dto_Command>;
}>;
type TeqFw_Cli_Lifecycle_Context = Readonly<{signal: AbortSignal}>;
type TeqFw_Cli_Api_Lifecycle_Participant = Readonly<{
    id: string;
    initialize?: (context: TeqFw_Cli_Lifecycle_Context) => void | Promise<void>;
    activate?: (context: TeqFw_Cli_Lifecycle_Context) => void | Promise<void>;
    deactivate?: (context: TeqFw_Cli_Lifecycle_Context) => void | Promise<void>;
    dispose?: (context: TeqFw_Cli_Lifecycle_Context) => void | Promise<void>;
}>;
type TeqFw_Cli_Api_Lifecycle_Provider = Readonly<{
    getLifecycleParticipants(): ReadonlyArray<TeqFw_Cli_Api_Lifecycle_Participant>;
}>;

type TeqFw_Cli_Package_Namespace = Readonly<{prefix: string; path: string; ext?: '.mjs' | '.js'}>;
type TeqFw_Cli_Package_Providers = Readonly<{
    cli?: ReadonlyArray<string>;
    lifecycle?: ReadonlyArray<string>;
}>;
type TeqFw_Cli_Package_Metadata = Readonly<{
    namespaces?: ReadonlyArray<TeqFw_Cli_Package_Namespace>;
    providers?: TeqFw_Cli_Package_Providers;
    instructions?: Readonly<Record<string, unknown>>;
}>;
type TeqFw_Cli_Package_Json = Readonly<{
    name?: string;
    dependencies?: Readonly<Record<string, string>>;
    teqfw?: TeqFw_Cli_Package_Metadata;
    [key: string]: unknown;
}>;
type TeqFw_Cli_Adapter_Io = Readonly<{write(message: string): void; error(message: string): void}>;
type TeqFw_Cli_Adapter_Signal = Readonly<{
    subscribe(handler: (signal: 'SIGINT' | 'SIGTERM') => void): () => void;
}>;
type TeqFw_Cli_Adapter_Parser_Selection = Readonly<
    | {kind: 'information'}
    | {kind: 'command'; command: TeqFw_Cli_Dto_Command; args: Readonly<Record<string, unknown>>; options: Readonly<Record<string, unknown>>}
>;
type TeqFw_Cli_Adapter_Parser_Internal = Readonly<{
    select(input: Readonly<{argv: ReadonlyArray<string>; version: string; commands: ReadonlyArray<TeqFw_Cli_Dto_Command>; io: TeqFw_Cli_Adapter_Io}>): TeqFw_Cli_Adapter_Parser_Selection;
}>;
type TeqFw_Cli_Host_Run_Input = Readonly<{
    argv: ReadonlyArray<string>;
    version: string;
    commands: ReadonlyArray<TeqFw_Cli_Dto_Command>;
    participants: ReadonlyArray<TeqFw_Cli_Api_Lifecycle_Participant>;
}>;
type TeqFw_Cli_Host = Readonly<{
    run(input: TeqFw_Cli_Host_Run_Input): Promise<TeqFw_Cli_Process_Status>;
}>;
type TeqFw_Cli_Bootstrap = Readonly<{
    run(input: Readonly<{argv: ReadonlyArray<string>; version: string}>): Promise<TeqFw_Cli_Process_Status>;
}>;
type TeqFw_Cli_Registry_Provider = Readonly<{
    build(kind?: TeqFw_Cli_Provider_Kind): Promise<ReadonlyArray<string>>;
}>;
type TeqFw_Cli_Registry_Command = Readonly<{
    build(providers: ReadonlyArray<TeqFw_Cli_Api_Provider>): ReadonlyArray<TeqFw_Cli_Dto_Command>;
}>;
type TeqFw_Cli_Registry_Lifecycle = Readonly<{
    build(providers: ReadonlyArray<TeqFw_Cli_Api_Lifecycle_Provider>): ReadonlyArray<TeqFw_Cli_Api_Lifecycle_Participant>;
}>;

type TeqFw_Cli_Util_DeepFreeze = typeof import('./src/Util/DeepFreeze.mjs').default;
type TeqFw_Cli_Error = typeof import('./src/Error.mjs').default;
type TeqFw_Cli_Dto_Argument__Factory$ = InstanceType<typeof import('./src/Dto/Argument.mjs').Factory>;
type TeqFw_Cli_Dto_Option__Factory$ = InstanceType<typeof import('./src/Dto/Option.mjs').Factory>;
type TeqFw_Cli_Dto_Command__Factory$ = InstanceType<typeof import('./src/Dto/Command.mjs').Factory>;
type TeqFw_Cli_Adapter_Parser_Internal$ = TeqFw_Cli_Adapter_Parser_Internal;
type TeqFw_Cli_Adapter_Signal$ = TeqFw_Cli_Adapter_Signal;
type TeqFw_Cli_Adapter_Io$ = TeqFw_Cli_Adapter_Io;
type TeqFw_Cli_Host$ = TeqFw_Cli_Host;
type TeqFw_Cli_Bootstrap$ = TeqFw_Cli_Bootstrap;
type TeqFw_Cli_Registry_Provider$ = TeqFw_Cli_Registry_Provider;
type TeqFw_Cli_Registry_Command$ = TeqFw_Cli_Registry_Command;
type TeqFw_Cli_Registry_Lifecycle$ = TeqFw_Cli_Registry_Lifecycle;
