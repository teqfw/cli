// @ts-check

/**
 * @namespace TeqFw_Cli_Config
 * @description Immutable computed runtime facts for a CLI application.
 */
export default class Config {
    /** @type {string} */
    applicationRoot;
    /** @type {string} */
    cwd;
    /** @type {ReadonlyArray<string>} */
    argv;
    /** @type {string|undefined} */
    dotenvPath;
    /** @type {boolean} */
    dotenvExplicit;
    /** @type {(input: TeqFw_Cli_Config) => void} */
    init;
    /** @param {object} deps
     * @param {TeqFw_Cli_Util_DeepFreeze} deps.deep
     */
    constructor({deep}) {
        /** @type {TeqFw_Cli_Config|undefined} */
        let state;
        /** @returns {TeqFw_Cli_Config} */
        const get = () => {
            if (!state) throw new Error('TeqFw_Cli_Config$ is not initialized.');
            return state;
        };
        Object.defineProperties(this, {
            applicationRoot: {enumerable: true, get: () => get().applicationRoot},
            cwd: {enumerable: true, get: () => get().cwd},
            argv: {enumerable: true, get: () => get().argv},
            dotenvPath: {enumerable: true, get: () => get().dotenvPath},
            dotenvExplicit: {enumerable: true, get: () => get().dotenvExplicit},
            init: {enumerable: false,
                value: (input) => {
                    if (state) throw new Error('TeqFw_Cli_Config$ is already initialized.');
                    state = deep({...input, argv: [...input.argv]});
                    Object.freeze(this);
                },
            },
        });
    }
}

export const __deps__ = Object.freeze({default: Object.freeze({deep: 'TeqFw_Cli_Util_DeepFreeze__default'})});
