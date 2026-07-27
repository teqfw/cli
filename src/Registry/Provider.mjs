// @ts-check
/**
 * @namespace TeqFw_Cli_Registry_Provider
 * @description Builds ordered provider-token registries from explicit TeqFW package metadata.
 */
/**
 * @param {unknown} token candidate token
 * @returns {boolean} whether the token is a provider CDC
 */
function isProviderToken(token) { return (typeof token === 'string') && /^[A-Za-z][0-9A-Za-z_]*(?:__[A-Za-z][0-9A-Za-z_]*)?\${1,3}$/.test(token); }
export default class ProviderRegistry {
    /**
     * @param {object} deps
     * @param {object} deps.packageGraph runtime package graph
     */
    constructor({packageGraph}) {
        /**
         * @param {'cli'|'lifecycle'} kind metadata provider kind
         * @returns {Promise<object>} ordered unique tokens
         */
        this.build = async function (kind = 'cli') {
            if (!['cli', 'lifecycle'].includes(kind)) throw new TypeError(`Unsupported provider kind: '${kind}'.`);
            const packages = await packageGraph.build(); const seen = new Set(); const result = [];
            for (const record of packages) {
                const teqfw = record.packageJson.teqfw;
                if (teqfw === undefined) continue;
                if (!teqfw || (typeof teqfw !== 'object') || Array.isArray(teqfw)) throw new Error(`Invalid teqfw metadata in package '${record.name}'.`);
                const providers = teqfw.providers;
                if (providers === undefined) continue;
                if (!providers || (typeof providers !== 'object') || Array.isArray(providers)) throw new Error(`Invalid teqfw.providers metadata in package '${record.name}'.`);
                const tokens = providers[kind] ?? [];
                if (!Array.isArray(tokens)) throw new Error(`teqfw.providers.${kind} must be an array in package '${record.name}'.`);
                for (const token of tokens) { if (!isProviderToken(token)) throw new Error(`Invalid ${kind} provider token in package '${record.name}': '${String(token)}'.`); if (seen.has(token)) throw new Error(`Duplicate ${kind} provider token: '${token}'.`); seen.add(token); result.push(token); }
            }
            return Object.freeze(result);
        };
    }
}
