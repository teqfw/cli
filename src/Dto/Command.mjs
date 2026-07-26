// @ts-check

/**
 * @namespace TeqFw_Cli_Dto_Command
 * @description Immutable parser-neutral command descriptor and validating factory.
 */

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:_-]*$/;
const SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;

export default class Command {
    /** Initializes a command descriptor. */
    constructor() {
        this.id = '';
        /** @type {ReadonlyArray<string>} */
        this.path = Object.freeze([]);
        this.summary = '';
        /** @type {string|undefined} */
        this.description = undefined;
        /** @type {ReadonlyArray<TeqFw_Cli_Dto_Argument>} */
        this.arguments = Object.freeze([]);
        /** @type {ReadonlyArray<TeqFw_Cli_Dto_Option>} */
        this.options = Object.freeze([]);
        /**
         * @returns {Promise<void>}
         */
        this.execute = async function () {};
        /** @type {(() => (void|Promise<void>))|undefined} */
        this.cleanup = undefined;
    }
}

export class Factory {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Dto_Argument__Factory$} deps.argumentFactory
     * @param {TeqFw_Cli_Dto_Option__Factory$} deps.optionFactory
     * @param {TeqFw_Cli_Util_DeepFreeze} deps.freeze
     */
    constructor({argumentFactory, optionFactory, freeze}) {
        /**
         * @param {Record<string, any>} data
         * @returns {TeqFw_Cli_Dto_Command}
         */
        this.create = function (data) {
            if ((data === null) || (typeof data !== 'object') || Array.isArray(data)) {
                throw new TypeError('Command descriptor must be an object.');
            }
            if ((typeof data.id !== 'string') || !ID_PATTERN.test(data.id)) {
                throw new TypeError(`Command id is invalid: '${String(data.id)}'.`);
            }
            if (!Array.isArray(data.path) || (data.path.length === 0)
                || data.path.some((item) => (typeof item !== 'string') || !SEGMENT_PATTERN.test(item))) {
                throw new TypeError('Command path must contain valid non-empty segments.');
            }
            if ((typeof data.summary !== 'string') || (data.summary.trim().length === 0)) {
                throw new TypeError('Command summary must be a non-empty string.');
            }
            if ((data.description !== undefined)
                && ((typeof data.description !== 'string') || (data.description.trim().length === 0))) {
                throw new TypeError('Command description must be a non-empty string when present.');
            }
            if (!Array.isArray(data.arguments)) throw new TypeError('Command arguments must be an array.');
            if (!Array.isArray(data.options)) throw new TypeError('Command options must be an array.');
            if ((typeof data.execute !== 'function') || (data.execute.constructor.name !== 'AsyncFunction')) {
                throw new TypeError('Command execute must be an async function.');
            }
            if ((data.cleanup !== undefined) && (typeof data.cleanup !== 'function')) {
                throw new TypeError('Command cleanup must be a function when present.');
            }

            const args = data.arguments.map((item) => argumentFactory.create(item));
            const options = data.options.map((item) => optionFactory.create(item));
            const inputNames = new Set();
            for (let index = 0; index < args.length; index += 1) {
                const item = args[index];
                if (inputNames.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`);
                inputNames.add(item.name);
                if (item.variadic && (index !== args.length - 1)) {
                    throw new TypeError('A variadic argument must be the last argument.');
                }
            }
            const shorts = new Set();
            for (const item of options) {
                if (inputNames.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`);
                inputNames.add(item.name);
                if (item.short && shorts.has(item.short)) {
                    throw new TypeError(`Duplicate option short alias: '${item.short}'.`);
                }
                if (item.short) shorts.add(item.short);
            }

            const result = new Command();
            result.id = data.id;
            result.path = freeze([...data.path]);
            result.summary = data.summary.trim();
            result.description = data.description?.trim();
            result.arguments = freeze(args);
            result.options = freeze(options);
            result.execute = data.execute;
            result.cleanup = data.cleanup;
            return freeze(result);
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
        argumentFactory: 'TeqFw_Cli_Dto_Argument__Factory$',
        optionFactory: 'TeqFw_Cli_Dto_Option__Factory$',
        freeze: 'TeqFw_Cli_Util_DeepFreeze__default',
    }),
});
