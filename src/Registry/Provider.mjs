// @ts-check

/**
 * @namespace TeqFw_Cli_Registry_Provider
 * @description Builds the ordered provider-token registry from explicit package metadata.
 */

/**
 * @param {unknown} token
 * @returns {boolean}
 */
function isProviderToken(token) {
    if ((typeof token !== "string") || !/^[\x00-\x7F]+$/.test(token)) return false;
    let core = token;
    const lifecycle = token.match(/(\${1,3})(?:_[a-z][0-9A-Za-z]*)*$/);
    if (lifecycle) {
        core = token.slice(0, lifecycle.index);
    } else if (token.includes("$") || /(?:^|[^_])_[a-z][0-9A-Za-z]*$/.test(token)) {
        return false;
    }
    const parts = core.split("__");
    if ((parts.length < 1) || (parts.length > 2)) return false;
    if (!/^[A-Za-z][0-9A-Za-z_]*$/.test(parts[0]) || parts[0].includes("__")) return false;
    return (parts.length === 1) || /^[^_$]+$/.test(parts[1]);
}

export default class ProviderRegistry {
    /**
     * @param {object} deps
     * @param {object} deps.packageGraph
     */
    constructor({packageGraph}) {
        /**
         * @returns {Promise<object>}
         */
        this.build = async function () {
            const packages = await packageGraph.build();
            const seen = new Set();
            const result = [];

            for (const record of packages) {
                const rawTeqfw = record.packageJson.teqfw;
                if (rawTeqfw === undefined) continue;
                if ((rawTeqfw === null) || (typeof rawTeqfw !== 'object') || Array.isArray(rawTeqfw)) {
                    throw new Error(`Invalid teqfw metadata in package '${record.name}'.`);
                }
                const providers = rawTeqfw.providers;
                if (providers === undefined) continue;
                if ((providers === null) || (typeof providers !== 'object') || Array.isArray(providers)) {
                    throw new Error(`Invalid teqfw.providers metadata in package '${record.name}'.`);
                }
                const cli = providers.cli;
                if (!Array.isArray(cli)) {
                    throw new Error(`teqfw.providers.cli must be an array in package '${record.name}'.`);
                }
                for (const token of cli) {
                    if (!isProviderToken(token)) {
                        throw new Error(`Invalid CLI provider token in package '${record.name}': '${String(token)}'.`);
                    }
                    if (seen.has(token)) throw new Error(`Duplicate CLI provider token: '${token}'.`);
                    seen.add(token);
                    result.push(token);
                }
            }
            return Object.freeze(result);
        };
    }
}
