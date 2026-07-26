// @ts-check

/**
 * @namespace TeqFw_Cli_Dto_Option
 * @description Immutable parser-neutral named option descriptor and factory.
 */

const KINDS = Object.freeze(['string', 'number', 'boolean']);
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const SHORT_PATTERN = /^[A-Za-z0-9]$/;

/**
 * @param {unknown} value
 * @param {string} kind
 * @param {string} field
 * @returns {void}
 */
function assertValueKind(value, kind, field) {
    if (typeof value !== kind) throw new TypeError(`${field} must be a ${kind}.`);
    if ((kind === 'number') && !Number.isFinite(value)) {
        throw new TypeError(`${field} must be a finite number.`);
    }
}

export default class Option {
    /** Initializes an option descriptor. */
    constructor() {
        /** @type {string} */
        this.name = '';
        /** @type {string|undefined} */
        this.short = undefined;
        /** @type {'string'|'number'|'boolean'} */
        this.kind = 'string';
        this.required = false;
        this.repeatable = false;
        this.description = '';
        /** @type {string|number|boolean|ReadonlyArray<string|number|boolean>|undefined} */
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
         * @returns {TeqFw_Cli_Dto_Option}
         */
        this.create = function (data) {
            if ((data === null) || (typeof data !== 'object') || Array.isArray(data)) {
                throw new TypeError('Option descriptor must be an object.');
            }
            if ((typeof data.name !== 'string') || !NAME_PATTERN.test(data.name)) {
                throw new TypeError(`Option name is invalid: '${String(data.name)}'.`);
            }
            if ((data.short !== undefined)
                && ((typeof data.short !== 'string') || !SHORT_PATTERN.test(data.short))) {
                throw new TypeError(`Option short alias is invalid: '${String(data.short)}'.`);
            }
            if ((typeof data.kind !== 'string') || !KINDS.includes(data.kind)) {
                throw new TypeError(`Option kind is invalid: '${String(data.kind)}'.`);
            }
            const required = data.required === undefined ? false : data.required;
            const repeatable = data.repeatable === undefined ? false : data.repeatable;
            if (typeof required !== 'boolean') throw new TypeError('Option required must be boolean.');
            if (typeof repeatable !== 'boolean') throw new TypeError('Option repeatable must be boolean.');
            if (typeof data.description !== 'string') {
                throw new TypeError('Option description must be a string.');
            }
            const hasDefault = Object.prototype.hasOwnProperty.call(data, 'defaultValue')
                && (data.defaultValue !== undefined);
            if (required && hasDefault) {
                throw new TypeError('A required option cannot define defaultValue.');
            }
            if (hasDefault && repeatable) {
                if (!Array.isArray(data.defaultValue)) {
                    throw new TypeError('A repeatable option defaultValue must be an array.');
                }
                for (const item of data.defaultValue) {
                    assertValueKind(item, data.kind, 'Option defaultValue item');
                }
            } else if (hasDefault) {
                assertValueKind(data.defaultValue, data.kind, 'Option defaultValue');
            }

            const result = new Option();
            result.name = data.name;
            result.short = /** @type {string|undefined} */ (data.short);
            result.kind = /** @type {'string'|'number'|'boolean'} */ (data.kind);
            result.required = required;
            result.repeatable = repeatable;
            result.description = data.description;
            result.defaultValue = Array.isArray(data.defaultValue)
                ? [...data.defaultValue]
                : /** @type {string|number|boolean|undefined} */ (data.defaultValue);
            return freeze(result);
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
        freeze: 'TeqFw_Cli_Util_DeepFreeze__default',
    }),
});
