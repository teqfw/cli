// @ts-check

/**
 * @namespace TeqFw_Cli_Bootstrap
 * @description Starts an already configured TeqFW application.
 */
export default class Bootstrap {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Host} deps.host
     * @param {TeqFw_Cli_Registry_Command} deps.commandRegistry
     * @param {TeqFw_Cli_Dto_Command__Factory} deps.commandFactory
     * @param {TeqFw_Cli_Node_Package_Registry} deps.packageRegistry
     * @param {TeqFw_Cli_Node_Fs} deps.fs
     * @param {TeqFw_Cli_Node_Path} deps.path
     */
    constructor({host, commandRegistry, commandFactory, packageRegistry, fs, path}) {
        /**
         * @param {TeqFw_Cli_Launch_Context} launch process launch context
         * @param {TeqFw_Cli_Bootstrap_Resolver} resolve private Composition Root resolution capability
         * @returns {Promise<number>}
         */
        this.start = async function (launch, resolve) {
            /** @type {ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>} */
            const packages = await new packageRegistry({fs, path, appRoot: launch.applicationRoot}).build();
            /** @type {TeqFw_Cli_Manifest_Command[]} */
            const commandDescriptors = [];
            /** @type {string[]} */
            const pluginIdentifiers = [];
            let defaultCommand;
            let version;
            for (const record of packages) {
                const cli = (/** @type {TeqFw_Cli_Manifest_TeqFw} */ (record.packageJson.teqfw ?? {})).fw?.cli ?? {};
                commandDescriptors.push(...(cli.commands ?? []));
                if (cli.plugin) pluginIdentifiers.push(cli.plugin);
                if (record.rootAbs === launch.applicationRoot) {
                    defaultCommand = cli.command?.default;
                    version = record.packageJson.version;
                }
            }
            const commands = commandRegistry.build(commandDescriptors);
            const run = host.open({
                argv: launch.argv,
                version,
                commands,
                defaultCommand,
                launch,
            });
            try {
                for (const identifier of pluginIdentifiers) {
                    await run.start(/** @type {TeqFw_Cli_Api_Plugin} */ (await resolve(identifier)));
                    if (run.isInterrupted()) return await run.close();
                }
                const selection = run.select();
                if (selection.kind === 'information') return await run.close(0);
                if (selection.kind === 'failure') return await run.close(selection.status);
                if (selection.kind === 'interrupted') return await run.close();
                const command = commandFactory.create(/** @type {Record<string, any>} */ (await resolve(selection.command.component)));
                await run.execute(selection, command);
                return await run.close(0);
            } catch (error) {
                run.fail(error);
                return await run.close();
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        host: 'TeqFw_Cli_Host$',
        commandRegistry: 'TeqFw_Cli_Registry_Command$',
        commandFactory: 'TeqFw_Cli_Dto_Command__Factory$',
        packageRegistry: 'TeqFw_Di_Node_Registry_Package__default',
        fs: 'node:fs/promises',
        path: 'node:path',
    }),
});
