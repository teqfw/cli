// @ts-check

/**
 * @namespace TeqFw_Cli_Bootstrap
 * @description Starts an already configured TeqFW application.
 */
export default class Bootstrap {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Host$} deps.host
     * @param {TeqFw_Cli_Registry_Command$} deps.commandRegistry
     * @param {TeqFw_Cli_Registry_Lifecycle$} deps.lifecycleRegistry
     */
    constructor({host, commandRegistry, lifecycleRegistry}) {
        /**
         * @param {TeqFw_Cli_Launch_Context} launch immutable process launch context
         * @returns {Promise<number>}
         */
        this.start = async function (launch) {
            /**
             * @param {ReadonlyArray<string>} identifiers
             * @param {string} kind
             * @returns {Promise<object>}
             */
            const resolveAll = async function (identifiers, kind) {
                const products = [];
                for (const identifier of identifiers) {
                    try { products.push(await launch.resolve(identifier)); }
                    catch (cause) { throw new Error(`Cannot resolve ${kind} provider '${identifier}'.`, {cause}); }
                }
                return Object.freeze(products);
            };
            const commandProviders = await resolveAll(launch.metadata.cli.commandProviders, 'command');
            const lifecycleProviders = await resolveAll(launch.metadata.cli.lifecycleProviders, 'lifecycle');
            return await host.run({
                argv: launch.argv,
                version: launch.version,
                commands: commandRegistry.build(commandProviders),
                participants: lifecycleRegistry.build(lifecycleProviders),
                defaultCommand: launch.metadata.cli.defaultCommand,
                launch,
            });
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        host: 'TeqFw_Cli_Host$',
        commandRegistry: 'TeqFw_Cli_Registry_Command$',
        lifecycleRegistry: 'TeqFw_Cli_Registry_Lifecycle$',
    }),
});
