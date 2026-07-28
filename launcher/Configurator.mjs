// @ts-check

import path from 'node:path';
import {pathToFileURL} from 'node:url';

function freeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const item of Object.values(value)) freeze(item);
    return Object.freeze(value);
}

function extensionList(value, name) {
    if (value === undefined) return [];
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'function')) {
        throw new Error(`Configurator result '${name}' must be an array of functions.`);
    }
    if (new Set(value).size !== value.length) throw new Error(`Configurator result '${name}' contains a duplicate function.`);
    return value;
}

/** @param {any} input */
export async function loadConfigurator(input) {
    const modulePath = path.resolve(input.applicationRoot, input.metadata.cli.configurator);
    const relative = path.relative(input.applicationRoot, modulePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Configurator module must remain inside the head application root.');
    let loaded;
    try {
        loaded = await import(pathToFileURL(modulePath).href);
    } catch (error) {
        throw new Error(`Cannot load application configurator '${input.metadata.cli.configurator}'.`, {cause: error});
    }
    if (typeof loaded.default !== 'function') throw new Error('Application configurator module must have a default function export.');
    const result = await loaded.default(freeze(input));
    if (result === undefined) return freeze({preprocessors: [], postprocessors: []});
    if (result === null || typeof result !== 'object' || Array.isArray(result)) throw new Error('Application configurator must return an object.');
    for (const key of Object.keys(result)) {
        if (!['preprocessors', 'postprocessors'].includes(key)) throw new Error(`Application configurator returned unsupported property '${key}'.`);
    }
    return freeze({preprocessors: extensionList(result.preprocessors, 'preprocessors'), postprocessors: extensionList(result.postprocessors, 'postprocessors')});
}
