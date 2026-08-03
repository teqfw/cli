// @ts-check

/**
 * @namespace TeqFw_Cli_Dto_Command_Descriptor
 * @description Immutable static command descriptor from package metadata.
 */
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:_-]*$/;

export default class Descriptor {
    /** Initializes a static command descriptor. */
    constructor() {
        /** @type {string} */
        this.id = '';
        /** @type {string} */
        this.summary = '';
        /** @type {ReadonlyArray<TeqFw_Cli_Dto_Argument>} */
        this.arguments = Object.freeze([]);
        /** @type {ReadonlyArray<TeqFw_Cli_Dto_Option>} */
        this.options = Object.freeze([]);
        /** @type {string} */
        this.component = '';
    }
}

export class Factory {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Dto_Argument__Factory} deps.argumentFactory
     * @param {TeqFw_Cli_Dto_Option__Factory} deps.optionFactory
     * @param {TeqFw_Cli_Util_DeepFreeze} deps.freeze
     */
    constructor({argumentFactory, optionFactory, freeze}) {
        /**
         * @param {TeqFw_Cli_Manifest_Command} data
         * @returns {TeqFw_Cli_Dto_Command_Descriptor}
         */
        this.create = function (data) {
            if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Command descriptor must be an object.');
            if (typeof data.id !== 'string' || !ID_PATTERN.test(data.id)) throw new TypeError(`Command id is invalid: '${String(data.id)}'.`);
            if (typeof data.summary !== 'string' || data.summary.trim().length === 0) throw new TypeError('Command summary must be a non-empty string.');
            if (!Array.isArray(data.arguments) || !Array.isArray(data.options)) throw new TypeError('Command arguments and options must be arrays.');
            if (typeof data.component !== 'string' || data.component.length === 0) throw new TypeError('Command component must be a non-empty Dependency Specifier.');
            const args = data.arguments.map((item) => argumentFactory.create(item));
            const options = data.options.map((item) => optionFactory.create(item));
            const names = new Set();
            const shorts = new Set();
            for (let index = 0; index < args.length; index += 1) {
                const item = args[index];
                if (names.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`);
                names.add(item.name);
                if (item.variadic && index !== args.length - 1) throw new TypeError('A variadic argument must be the last argument.');
            }
            for (const item of options) {
                if (names.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`);
                names.add(item.name);
                if (item.short && shorts.has(item.short)) throw new TypeError(`Duplicate option short alias: '${item.short}'.`);
                if (item.short) shorts.add(item.short);
            }
            const result = new Descriptor();
            result.id = data.id;
            result.summary = data.summary.trim();
            result.arguments = freeze(args);
            result.options = freeze(options);
            result.component = data.component;
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
