// @ts-check

/**
 * @namespace TeqFw_Cli_Registry_Command
 * @description Validates static command metadata and builds a deterministic immutable command catalogue.
 */

export default class CommandRegistry {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Dto_Command_Descriptor__Factory} deps.descriptorFactory
     */
    constructor({descriptorFactory}) {
        /**
         * @param {ReadonlyArray<TeqFw_Cli_Manifest_Command>} descriptors
         * @returns {ReadonlyArray<TeqFw_Cli_Dto_Command_Descriptor>}
         */
        this.build = function (descriptors) {
            if (!Array.isArray(descriptors)) throw new TypeError('Command descriptors must be an array.');
            const ids = new Set();
            const paths = new Set();
            const result = [];
            for (const raw of descriptors) {
                const command = descriptorFactory.create(raw);
                const pathKey = command.path.join('\u0000');
                if (ids.has(command.id)) throw new Error(`Duplicate command id: '${command.id}'.`);
                if (paths.has(pathKey)) throw new Error(`Duplicate command path: '${command.path.join(' ')}'.`);
                ids.add(command.id);
                paths.add(pathKey);
                result.push(command);
            }
            return Object.freeze(result);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        descriptorFactory: 'TeqFw_Cli_Dto_Command_Descriptor__Factory$',
    }),
});
