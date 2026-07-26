// @ts-check

/**
 * @namespace TeqFw_Cli_Bootstrap
 * @description Coordinates discovery, DI configuration, provider resolution, and runner invocation.
 */

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
    if (!(error instanceof Error)) return String(error);
    const cause = error.cause instanceof Error ? `: ${error.cause.message}` : '';
    return `${error.message}${cause}`;
}

export default class Bootstrap {
    /**
     * @param {object} deps
     * @param {object} deps.namespaceRegistry
     * @param {object} deps.providerRegistry
     * @param {object} deps.container
     * @param {object} deps.io
     */
    constructor({namespaceRegistry, providerRegistry, container, io}) {
        /**
         * @param {object} deps
         * @param {object} deps.argv
         * @param {string} deps.version
         * @returns {Promise<number>}
         */
        this.run = async function ({argv, version}) {
            try {
                const namespaceEntries = await namespaceRegistry.build();
                for (const entry of namespaceEntries) {
                    container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
                }

                const tokens = await providerRegistry.build();
                const providers = [];
                for (const token of tokens) {
                    try {
                        providers.push(await container.get(token));
                    } catch (cause) {
                        throw new Error(`Cannot resolve CLI provider '${token}'`, {cause});
                    }
                }

                const commandRegistry = await container.get('TeqFw_Cli_Registry_Command$');
                const commands = commandRegistry.build(Object.freeze(providers));
                const runner = await container.get('TeqFw_Cli_Runner$$');
                return await runner.run({argv, version, commands});
            } catch (error) {
                io.error(`${errorMessage(error)}\n`);
                return 1;
            }
        };
    }
}
