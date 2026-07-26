// @ts-check

/**
 * @namespace TeqFw_Cli_Dto_Argument
 * @description Immutable parser-neutral positional argument descriptor and factory.
 */

const KINDS = Object.freeze(['string', 'number', 'boolean']);
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

/**
 * @param {unknown} value
 * @param {string} kind
 * @param {string} field
 * @returns {void}
 */
function assertValueKind(value, kind, field) {
    if (typeof value !== kind) {
        throw new TypeError(`${field} must be a ${kind}.`);
    }
    if ((kind === 'number') && !Number.isFinite(value)) {
        throw new TypeError(`${field} must be a finite number.`);
    }
}

export default class Argument {
    /** Initializes an argument descriptor. */
    constructor() {
        /** @type {string} */
        this.name = '';
        /** @type {'string'|'number'|'boolean'} */
        this.kind = 'string';
        this.required = false;
        this.variadic = false;
        this.description = '';
        /** @type {string|number|boolean|undefined} */
        this.defaultValue = undefined;
    }
}

export class Factory {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Util_DeepFreeze} deps.freeze
     */
    constructor({freeze}) {
        /**
         * @param {Record<string, unknown>} data
         * @returns {TeqFw_Cli_Dto_Argument}
         */
        this.create = function (data) {
            if ((data === null) || (typeof data !== 'object') || Array.isArray(data)) {
                throw new TypeError('Argument descriptor must be an object.');
            }
            if ((typeof data.name !== 'string') || !NAME_PATTERN.test(data.name)) {
                throw new TypeError(`Argument name is invalid: '${String(data.name)}'.`);
            }
            if ((typeof data.kind !== 'string') || !KINDS.includes(data.kind)) {
                throw new TypeError(`Argument kind is invalid: '${String(data.kind)}'.`);
            }
            const required = data.required === undefined ? false : data.required;
            const variadic = data.variadic === undefined ? false : data.variadic;
            if (typeof required !== 'boolean') throw new TypeError('Argument required must be boolean.');
            if (typeof variadic !== 'boolean') throw new TypeError('Argument variadic must be boolean.');
            if (typeof data.description !== 'string') {
                throw new TypeError('Argument description must be a string.');
            }
            const hasDefault = Object.prototype.hasOwnProperty.call(data, 'defaultValue')
                && (data.defaultValue !== undefined);
            if (required && hasDefault) {
                throw new TypeError('A required argument cannot define defaultValue.');
            }
            if (hasDefault) assertValueKind(data.defaultValue, data.kind, 'Argument defaultValue');

            const result = new Argument();
            result.name = data.name;
            result.kind = /** @type {'string'|'number'|'boolean'} */ (data.kind);
            result.required = required;
            result.variadic = variadic;
            result.description = data.description;
            result.defaultValue = /** @type {string|number|boolean|undefined} */ (data.defaultValue);
            return freeze(result);
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
        freeze: 'TeqFw_Cli_Util_DeepFreeze__default',
    }),
});
