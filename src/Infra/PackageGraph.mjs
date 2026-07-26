// @ts-check

/**
 * @namespace TeqFw_Cli_Infra_PackageGraph
 * @description Traverses the real installed runtime dependency graph once in deterministic order.
 */

export default class PackageGraph {
    /**
     * @param {object} deps
     * @param {object} deps.fs
     * @param {object} deps.path
     * @param {string} deps.appRoot
     */
    constructor({fs, path, appRoot}) {
        const appRootAbs = path.resolve(appRoot);

        /**
         * @param {string} root
         * @param {string} candidate
         * @returns {boolean}
         */
        const isInside = function (root, candidate) {
            const relative = path.relative(root, candidate);
            return (relative === '') || (!relative.startsWith('..') && !path.isAbsolute(relative));
        };

        /**
         * @param {string} packageRoot
         * @returns {Promise<object>}
         */
        const readPackage = async function (packageRoot) {
            const file = path.join(packageRoot, 'package.json');
            let source;
            try {
                source = await fs.readFile(file, 'utf8');
            } catch (cause) {
                throw new Error(`Cannot read package metadata: '${file}'.`, {cause});
            }
            let data;
            try {
                data = JSON.parse(source);
            } catch (cause) {
                throw new Error(`Package metadata is not valid JSON: '${file}'.`, {cause});
            }
            if ((data === null) || (typeof data !== 'object') || Array.isArray(data)) {
                throw new Error(`Package metadata must be an object: '${file}'.`);
            }
            if ((data.dependencies !== undefined)
                && ((data.dependencies === null) || (typeof data.dependencies !== 'object')
                    || Array.isArray(data.dependencies))) {
                throw new Error(`Package dependencies must be an object: '${file}'.`);
            }
            return data;
        };

        /**
         * @param {string} packageName
         * @param {string} fromRoot
         * @returns {Promise<string>}
         */
        const resolveDependency = async function (packageName, fromRoot) {
            let cursor = fromRoot;
            while (isInside(appRootAbs, cursor)) {
                const candidate = path.join(cursor, 'node_modules', packageName);
                try {
                    const stat = await fs.stat(path.join(candidate, 'package.json'));
                    if (stat.isFile()) return candidate;
                } catch {
                    // Continue with a hoisted parent location.
                }
                if (cursor === appRootAbs) break;
                const parent = path.dirname(cursor);
                if (parent === cursor) break;
                cursor = parent;
            }
            throw new Error(`Installed dependency is not found: '${packageName}' from '${fromRoot}'.`);
        };

        /**
         * @returns {Promise<object>}
         */
        this.build = async function () {
            const queue = [appRootAbs];
            const visited = new Set();
            /** @type {TeqFw_Cli_Infra_PackageGraph_Record[]} */
            const result = [];

            while (queue.length > 0) {
                const rootAbs = /** @type {string} */ (queue.shift());
                const rootReal = await fs.realpath(rootAbs);
                if (visited.has(rootReal)) continue;
                visited.add(rootReal);

                const packageJson = await readPackage(rootAbs);
                const name = typeof packageJson.name === 'string' ? packageJson.name : rootAbs;
                const record = {name, rootAbs, rootReal, packageJson};
                Object.freeze(record);
                result.push(record);

                const names = Object.keys(packageJson.dependencies ?? {}).sort();
                for (const dependencyName of names) {
                    queue.push(await resolveDependency(dependencyName, rootAbs));
                }
            }
            return Object.freeze(result);
        };
    }
}
