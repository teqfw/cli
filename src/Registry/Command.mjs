// @ts-check

/**
 * @namespace TeqFw_Cli_Registry_Command
 * @description Validates provider output and builds a deterministic immutable command registry.
 */

/**
 * @param {unknown} value
 * @param {object} seen
 * @returns {boolean}
 */
function isDeepFrozen(value, seen = new WeakSet()) {
    if ((value === null) || (typeof value !== 'object')) return true;
    if (seen.has(value)) return true;
    seen.add(value);
    if (!Object.isFrozen(value)) return false;
    return Reflect.ownKeys(value).every(
        (key) => isDeepFrozen(/** @type {Record<PropertyKey, unknown>} */ (value)[key], seen),
    );
}

export default class CommandRegistry {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Dto_Command__Factory$} deps.commandFactory
     */
    constructor({commandFactory}) {
        /**
         * @param {ReadonlyArray<unknown>} providers
         * @returns {ReadonlyArray<TeqFw_Cli_Dto_Command>}
         */
        this.build = function (providers) {
            if (!Array.isArray(providers)) throw new TypeError('Providers must be an array.');
            const ids = new Set();
            const paths = new Set();
            const result = [];

            for (const provider of providers) {
                if ((provider === null) || (typeof provider !== 'object')
                    || (typeof provider.getCommands !== 'function')) {
                    throw new TypeError('A CLI provider must expose getCommands().');
                }
                const rawCommands = provider.getCommands();
                if (!Array.isArray(rawCommands) || !Object.isFrozen(rawCommands)) {
                    throw new TypeError('Provider getCommands() must return an immutable array.');
                }
                for (const raw of rawCommands) {
                    if (!isDeepFrozen(raw)) {
                        throw new TypeError('Provider command descriptors must be deeply immutable.');
                    }
                    const command = commandFactory.create(raw);
                    const pathKey = command.path.join('\u0000');
                    if (ids.has(command.id)) throw new Error(`Duplicate command id: '${command.id}'.`);
                    if (paths.has(pathKey)) {
                        throw new Error(`Duplicate command path: '${command.path.join(' ')}'.`);
                    }
                    ids.add(command.id);
                    paths.add(pathKey);
                    result.push(command);
                }
            }
            return Object.freeze(result);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        commandFactory: 'TeqFw_Cli_Dto_Command__Factory$',
    }),
});
