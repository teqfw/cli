// @ts-check

/**
 * @namespace TeqFw_Cli_Adapter_Io
 * @description Testable stdout and stderr adapter.
 */

export default class Io {
    /**
     * @param {object} deps
     * @param {object} deps.processModule
     */
    constructor({processModule}) {
        const process = processModule.default;
        /**
         * @param {string} message
         * @returns {void}
         */
        this.write = function (message) {
            process.stdout.write(String(message));
        };

        /**
         * @param {string} message
         * @returns {void}
         */
        this.error = function (message) {
            process.stderr.write(String(message));
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        processModule: 'node:process',
    }),
});
