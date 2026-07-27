// @ts-check
/**
 * @namespace TeqFw_Cli_Bootstrap
 * @description Performs composition before handing the assembled application to the lifecycle host.
 */
/**
 * @param {unknown} error failure value
 * @returns {string} safe message
 */
function errorMessage(error) { return error instanceof Error ? error.message : String(error); }
export default class Bootstrap {
    /**
     * @param {object} deps
     * @param {object} deps.namespaceRegistry namespace registry
     * @param {object} deps.providerRegistry provider registry
     * @param {object} deps.container DI container
     * @param {object} deps.io output adapter
     */
    constructor({namespaceRegistry, providerRegistry, container, io}) {
        /**
         * @param {object} deps
         * @param {string[]} deps.argv process arguments
         * @param {string} deps.version host version
         * @returns {Promise<number>} process result
         */
        this.run = async function ({argv, version}) {
            try {
                const namespaceEntries = await namespaceRegistry.build(); for (const entry of namespaceEntries) container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
                const loggerProvider = await container.get('TeqFw_Log_Provider$'); const log = loggerProvider.forSource('TeqFw_Cli_Bootstrap'); log.info('Composition started.');
                /**
                 * @param {'cli'|'lifecycle'} kind provider category
                 * @returns {Promise<object>} resolved provider products
                 */
                const resolve = async function (kind) { const providers = []; for (const token of await providerRegistry.build(kind)) { try { providers.push(await container.get(token)); } catch (cause) { throw new Error(`Cannot resolve ${kind} provider '${token}'.`, {cause}); } } return Object.freeze(providers); };
                const [commandProviders, lifecycleProviders] = await Promise.all([resolve('cli'), resolve('lifecycle')]);
                const commands = (await container.get('TeqFw_Cli_Registry_Command$')).build(commandProviders); const participants = (await container.get('TeqFw_Cli_Registry_Lifecycle$')).build(lifecycleProviders); const host = await container.get('TeqFw_Cli_Host$');
                log.info('Composition completed.', {commands: commands.length, participants: participants.length}); return await host.run({argv, version, commands, participants});
            } catch (error) { io.error(`${errorMessage(error)}\n`); return 1; }
        };
    }
}
