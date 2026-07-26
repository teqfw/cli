type TeqFw_Cli_Value_Kind = 'string' | 'number' | 'boolean';
type TeqFw_Cli_Value = string | number | boolean;

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

type TeqFw_Cli_Infra_PackageGraph_Record = Readonly<{
    name: string;
    rootAbs: string;
    rootReal: string;
    packageJson: Record<string, any>;
}>;

type TeqFw_Cli_Util_DeepFreeze = typeof import('./src/Util/DeepFreeze.mjs').default;
type TeqFw_Cli_Error = typeof import('./src/Error.mjs').default;
type TeqFw_Cli_Dto_Argument__Factory$ = InstanceType<typeof import('./src/Dto/Argument.mjs').Factory>;
type TeqFw_Cli_Dto_Option__Factory$ = InstanceType<typeof import('./src/Dto/Option.mjs').Factory>;
type TeqFw_Cli_Dto_Command__Factory$ = InstanceType<typeof import('./src/Dto/Command.mjs').Factory>;
type TeqFw_Cli_Adapter_Parser_Commander$ = InstanceType<typeof import('./src/Adapter/Parser/Commander.mjs').default>;
type TeqFw_Cli_Adapter_Signal$ = InstanceType<typeof import('./src/Adapter/Signal.mjs').default>;
type TeqFw_Cli_Adapter_Io$ = InstanceType<typeof import('./src/Adapter/Io.mjs').default>;
type TeqFw_Cli_Runner$ = InstanceType<typeof import('./src/Runner.mjs').default>;
