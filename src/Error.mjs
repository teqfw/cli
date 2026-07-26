// @ts-check

/**
 * @namespace TeqFw_Cli_Error
 * @description Creates categorized CLI host errors without coupling callers to an error subclass.
 */

/**
 * @param {string} category
 * @param {string} message
 * @param {object} data
 * @returns {object}
 */
export default function createError(category, message, data = {}) {
    const result = /** @type {Error & {category: string, reported: boolean}} */ (
        new Error(message, data.cause === undefined ? undefined : {cause: data.cause})
    );
    result.name = 'TeqFwCliError';
    result.category = category;
    result.reported = data.reported === true;
    return result;
}
