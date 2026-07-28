// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasConfigurator(manifest) {
    const value = manifest.teqfw;
    return isRecord(value) && isRecord(value.fw) && isRecord(value.fw.cli)
        && isRecord(value.fw.cli.container)
        && typeof value.fw.cli.container.configurator === 'string';
}

/**
 * Finds the nearest ancestor that declares the application-owned configurator.
 * The check makes a nested invocation select its application instead of an
 * arbitrary package directory that merely contains package.json.
 *
 * @param {string} cwd original working directory
 * @returns {Promise<{root: string, manifest: Readonly<Record<string, unknown>>}>}
 */
export async function discoverHeadApplication(cwd) {
    let cursor = path.resolve(cwd);
    for (;;) {
        const file = path.join(cursor, 'package.json');
        try {
            const source = await fs.readFile(file, 'utf8');
            const manifest = JSON.parse(source);
            if (!isRecord(manifest)) throw new Error('package.json root must be an object.');
            if (hasConfigurator(manifest)) return Object.freeze({root: cursor, manifest: freeze(manifest)});
        } catch (error) {
            if (error && typeof error === 'object' && error.code === 'ENOENT') {
                // Continue towards the filesystem root.
            } else if (error instanceof SyntaxError) {
                throw new Error(`Invalid package.json at '${file}': ${error.message}`);
            } else if (error instanceof Error && !error.message.includes('package.json root')) {
                throw error;
            }
        }
        const parent = path.dirname(cursor);
        if (parent === cursor) break;
        cursor = parent;
    }
    throw new Error(`No TeqFW head application was found above '${path.resolve(cwd)}'. A head package must declare teqfw.fw.cli.container.configurator.`);
}

/** @param {unknown} value @returns {any} */
function freeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const item of Object.values(value)) freeze(item);
    return Object.freeze(value);
}
