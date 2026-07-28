type TeqFw_Cli_Process_Status = 0 | 1 | 2 | 130 | 143;
type TeqFw_Cli_Command_Lifetime = 'finite' | 'long-running';
type TeqFw_Cli_Command_Runtime = Readonly<{done: Promise<unknown>; stop(): void | Promise<void>}>;
type TeqFw_Cli_Container_Configurator_Input = Readonly<{applicationRoot: string; cwd: string; argv: ReadonlyArray<string>; applicationManifest: Readonly<Record<string, unknown>>; packages: ReadonlyArray<unknown>; metadata: Readonly<Record<string, unknown>>; invocation: Readonly<{argv: ReadonlyArray<string>}>; services: Readonly<Record<string, never>>}>;
type TeqFw_Cli_Container_Configurator_Result = Readonly<{preprocessors?: ReadonlyArray<(dependency: unknown) => unknown>; postprocessors?: ReadonlyArray<(value: unknown) => unknown>}>;
type TeqFw_Cli_Container_Configurator = (input: TeqFw_Cli_Container_Configurator_Input) => TeqFw_Cli_Container_Configurator_Result | Promise<TeqFw_Cli_Container_Configurator_Result>;
