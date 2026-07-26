// @ts-check

/**
 * @namespace TeqFw_Cli_Util_DeepFreeze
 * @description Recursively freezes data graphs while preserving callable identities.
 */

/**
 * @param {unknown} value
 * @param {object} seen
 * @returns {any}
 */
export default function deepFreeze(value, seen = new WeakSet()) {
    if ((value === null) || (typeof value !== 'object')) return value;
    if ((typeof AbortSignal !== 'undefined') && (value instanceof AbortSignal)) return value;
    if (seen.has(value)) return value;
    seen.add(value);
    for (const key of Reflect.ownKeys(value)) {
        deepFreeze(/** @type {Record<PropertyKey, unknown>} */ (value)[key], seen);
    }
    return Object.freeze(value);
}
