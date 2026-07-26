// @ts-check

/**
 * @namespace TeqFw_Cli_Adapter_Signal
 * @description Isolates Node process signal subscriptions from lifecycle orchestration.
 */

export default class Signal {
    /**
     * @param {object} deps
     * @param {object} deps.processModule
     */
    constructor({processModule}) {
        const process = processModule.default;
        /**
         * @param {(signal: 'SIGINT'|'SIGTERM') => void} handler
         * @returns {() => void}
         */
        this.subscribe = function (handler) {
            let active = true;
            const keepAlive = setInterval(() => {}, 2147483647);
            /** @returns {void} */
            const onInt = function () {
                handler('SIGINT');
            };
            /** @returns {void} */
            const onTerm = function () {
                handler('SIGTERM');
            };
            process.on('SIGINT', onInt);
            process.on('SIGTERM', onTerm);
            return function () {
                if (!active) return;
                active = false;
                clearInterval(keepAlive);
                process.off('SIGINT', onInt);
                process.off('SIGTERM', onTerm);
            };
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        processModule: 'node:process',
    }),
});
