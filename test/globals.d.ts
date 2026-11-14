export {};

declare global {
    var __fixtureCalls: string[];
    var __fixtureConfigurator: string;
    var __fixtureConfiguratorArgv: string[];
    var __fixturePluginConfig: Record<string, string>;
    var __fixtureCommandConfig: unknown;
    var __fixtureRuntimeConfig: unknown;
    var __fixtureCommandRuntimeConfig: {root: string; cwd: string; argv: string[]};
    var __fixtureLaunch: TeqFw_Cli_Launch_Context;
    var __fixtureResourceActive: boolean;
    var __fixtureEchoTarget: string;
    var __fixtureEchoRoot: string;
    var __fixtureEchoCwd: string;
    var __fixturePreprocessContexts: {depId: string; root: string; parent: string | null; stack: string[]}[];
}
