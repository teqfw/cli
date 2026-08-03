// @ts-check
/**
 * @namespace TeqFw_Cli_Dto_Command
 * @description Immutable parser-neutral finite and long-running command descriptors.
 */
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:_-]*$/;
const SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;
export default class Command {
    /** Initializes a command descriptor. */
    constructor() {
        this.id = ''; this.path = Object.freeze([]); this.summary = ''; this.lifetime = 'finite'; this.description = undefined;
        this.arguments = Object.freeze([]); this.options = Object.freeze([]); this.execute = undefined; this.start = undefined; this.cleanup = undefined;
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
         * @param {Record<string, any>} data
         * @returns {TeqFw_Cli_Dto_Command}
         */
        this.create = function (data) {
            if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Command descriptor must be an object.');
            if (typeof data.id !== 'string' || !ID_PATTERN.test(data.id)) throw new TypeError(`Command id is invalid: '${String(data.id)}'.`);
            if (!Array.isArray(data.path) || data.path.length === 0 || data.path.some((item) => typeof item !== 'string' || !SEGMENT_PATTERN.test(item))) throw new TypeError('Command path must contain valid non-empty segments.');
            if (typeof data.summary !== 'string' || data.summary.trim().length === 0) throw new TypeError('Command summary must be a non-empty string.');
            if (data.lifetime !== 'finite' && data.lifetime !== 'long-running') throw new TypeError("Command lifetime must be 'finite' or 'long-running'.");
            if (data.lifetime === 'finite' && (typeof data.execute !== 'function' || data.execute.constructor.name !== 'AsyncFunction')) throw new TypeError('Finite command execute must be an async function.');
            if (data.lifetime === 'long-running' && (typeof data.start !== 'function' || data.start.constructor.name !== 'AsyncFunction')) throw new TypeError('Long-running command start must be an async function.');
            if (!Array.isArray(data.arguments) || !Array.isArray(data.options)) throw new TypeError('Command arguments and options must be arrays.');
            if (data.cleanup !== undefined && typeof data.cleanup !== 'function') throw new TypeError('Command cleanup must be a function when present.');
            const args = data.arguments.map((item) => argumentFactory.create(item)); const options = data.options.map((item) => optionFactory.create(item)); const names = new Set(); const shorts = new Set();
            for (let index = 0; index < args.length; index += 1) { const item = args[index]; if (names.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`); names.add(item.name); if (item.variadic && index !== args.length - 1) throw new TypeError('A variadic argument must be the last argument.'); }
            for (const item of options) { if (names.has(item.name)) throw new TypeError(`Duplicate input name: '${item.name}'.`); names.add(item.name); if (item.short && shorts.has(item.short)) throw new TypeError(`Duplicate option short alias: '${item.short}'.`); if (item.short) shorts.add(item.short); }
            const result = new Command(); result.id = data.id; result.path = freeze([...data.path]); result.summary = data.summary.trim(); result.lifetime = data.lifetime; result.description = data.description?.trim(); result.arguments = freeze(args); result.options = freeze(options); result.execute = data.execute; result.start = data.start; result.cleanup = data.cleanup;
            return freeze(result);
        };
    }
}
export const __deps__ = Object.freeze({Factory: Object.freeze({argumentFactory: 'TeqFw_Cli_Dto_Argument__Factory$', optionFactory: 'TeqFw_Cli_Dto_Option__Factory$', freeze: 'TeqFw_Cli_Util_DeepFreeze__default'})});
