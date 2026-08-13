#!/usr/bin/env node
// @ts-check

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import Container from '@teqfw/di';
import PackageRegistry from '@teqfw/di/node/registry/package';

/**
 * Well-known global npm module locations probed after the local application tree.
 * The active npm global root is reached through the launcher location when teq is globally installed,
 * or through the `npm_config_prefix` environment variable npm exposes to its scripts.
 */
const GLOBAL_NODE_MODULES = Object.freeze([
    path.join(os.homedir(), '.npm-global', 'lib', 'node_modules'),
    '/usr/local/lib/node_modules',
    '/usr/lib/node_modules',
]);

/**
 * @returns {ReadonlyArray<string>}
 */
function globalNodeModulesCandidates() {
    const list = [];
    if (typeof process.env.npm_config_prefix === 'string' && process.env.npm_config_prefix.length > 0) {
        list.push(path.join(process.env.npm_config_prefix, 'lib', 'node_modules'));
    }
    return Object.freeze([...list, ...GLOBAL_NODE_MODULES]);
}

/** Physical directory of this module; its upward walk reaches global siblings of a globally installed teq. */
const launcherDir = path.dirname(fileURLToPath(import.meta.url));

async function isMainModule() {
    if (process.env.pm_exec_path) {
        try {
            const entryPath = await fs.realpath(process.env.pm_exec_path);
            const modulePath = await fs.realpath(fileURLToPath(import.meta.url));
            return entryPath === modulePath;
        } catch {
            return false;
        }
    }
    if (typeof import.meta.main === 'boolean') return import.meta.main;
    try {
        const entryPath = await fs.realpath(process.argv[1]);
        const modulePath = await fs.realpath(fileURLToPath(import.meta.url));
        return entryPath === modulePath;
    } catch {
        return false;
    }
}

async function detectApplicationRoot() {
    const packageRoot = path.dirname(path.dirname(await fs.realpath(fileURLToPath(import.meta.url))));
    try {
        if ((await fs.stat(path.join(packageRoot, 'node_modules'))).isDirectory()) return packageRoot;
    } catch {}
    for (let current = packageRoot; ; current = path.dirname(current)) {
        if (path.basename(current) === 'node_modules') return path.dirname(current);
        if (path.dirname(current) === current) throw new Error(`Unable to derive application root from '${packageRoot}'.`);
    }
}

/**
 * Resolves an installed package root with the Node.js upward walk: each ancestor of `startDir`
 * contributes `<dir>/node_modules/<name>`. This finds local, user-global, and machine-global installs alike.
 *
 * @param {string} name
 * @param {string} startDir
 * @returns {Promise<string|undefined>}
 */
async function findInNodeModules(name, startDir) {
    for (let cursor = path.resolve(startDir); ; cursor = path.dirname(cursor)) {
        const candidate = path.join(cursor, 'node_modules', name);
        try {
            await fs.stat(path.join(candidate, 'package.json'));
            return candidate;
        } catch {}
        if (path.dirname(cursor) === cursor) return undefined;
    }
}

/**
 * Reads and parses a package manifest, producing an actionable error when the root is unusable.
 *
 * @param {string} dir
 * @returns {Promise<Record<string, any>>}
 */
async function readPackageManifest(dir) {
    let content;
    try {
        content = await fs.readFile(path.join(dir, 'package.json'), 'utf8');
    } catch (error) {
        throw new Error(`Unable to read package manifest at '${dir}': ${String(error)}`);
    }
    try {
        const value = /** @type {unknown} */ (JSON.parse(content));
        if ((value === null) || (typeof value !== 'object') || Array.isArray(value)) throw new Error('manifest root must be an object');
        return /** @type {Record<string, any>} */ (value);
    } catch (error) {
        throw new Error(`Invalid package manifest at '${dir}': ${String(error)}`);
    }
}

/**
 * Verifies the explicit host manifest contract: canonical TeqFW namespaces and the teq CLI host dependency.
 *
 * @param {string} hostName
 * @param {Record<string, any>} manifest
 * @returns {void}
 */
function validateHostManifest(hostName, manifest) {
    const namespaces = manifest.teqfw?.fw?.di?.namespaces;
    if (!Array.isArray(namespaces) || namespaces.length === 0) {
        throw new Error(`Host '${hostName}' does not declare a usable TeqFW host manifest: 'teqfw.fw.di.namespaces' is missing.`);
    }
    const cliDependency = manifest.dependencies?.['@teqfw/cli'];
    if ((typeof cliDependency !== 'string') || (cliDependency.length === 0)) {
        throw new Error(`Host '${hostName}' must declare '@teqfw/cli' as a dependency.`);
    }
}

/**
 * Resolves the explicit host application root. With an explicit `--host-root` the path is resolved relative
 * to the original cwd and its manifest name is validated; otherwise the host is searched in the supplied
 * search roots and the well-known global npm locations.
 *
 * @param {object} params
 * @param {string} params.hostName
 * @param {string|undefined} params.hostRootInput
 * @param {string} params.cwd
 * @param {ReadonlyArray<string>} params.searchRoots
 * @returns {Promise<string>}
 */
async function resolveHostRoot({hostName, hostRootInput, cwd, searchRoots}) {
    let root;
    if (hostRootInput !== undefined) {
        root = path.resolve(cwd, hostRootInput);
        const manifest = await readPackageManifest(root);
        if (manifest.name !== hostName) {
            throw new Error(`Host root '${root}' declares package '${String(manifest.name)}', which does not match '--host ${hostName}'.`);
        }
        validateHostManifest(hostName, manifest);
    } else {
        for (const base of searchRoots) {
            const found = await findInNodeModules(hostName, base);
            if (found) {
                root = found;
                break;
            }
        }
        if (!root) {
            for (const dir of globalNodeModulesCandidates()) {
                const candidate = path.join(dir, hostName);
                try {
                    await fs.stat(path.join(candidate, 'package.json'));
                    root = candidate;
                    break;
                } catch {}
            }
        }
        if (!root) {
            throw new Error(`Selected host '${hostName}' is not found in the local application or the global npm module locations.`);
        }
        validateHostManifest(hostName, await readPackageManifest(root));
    }
    return root;
}

/**
 * @param {ReadonlyArray<string>} argv
 * @returns {string|undefined}
 */
function findCommandIdentifier(argv) {
    for (let index = 2; index < argv.length; index++) {
        const value = argv[index];
        if ((value.length > 0) && !value.startsWith('-')) return value;
    }
    return undefined;
}

/**
 * @param {ReadonlyArray<string>} argv
 * @returns {{argv: string[], dotenvPath: string|undefined, dotenvExplicit: boolean, hostName: string|undefined, hostRoot: string|undefined}}
 */
function extractGlobalOptions(argv) {
    const result = [];
    let dotenvPath;
    let dotenvExplicit = false;
    let hostName;
    let hostRoot;
    /** Command identifier boundary: `--host`/`--host-root` are consumed only before the first non-option token. */
    let boundary = false;
    for (let index = 0; index < argv.length; index++) {
        const value = argv[index];
        if (value === '--dotenv-file') {
            const next = argv[++index];
            if (next === undefined) throw new Error("Option '--dotenv-file' requires a value.");
            dotenvPath = next;
            dotenvExplicit = true;
        } else if (value.startsWith('--dotenv-file=')) {
            dotenvPath = value.slice('--dotenv-file='.length);
            if (!dotenvPath) throw new Error("Option '--dotenv-file' requires a value.");
            dotenvExplicit = true;
        } else if ((index >= 2) && !boundary && (value === '--host')) {
            const next = argv[++index];
            if (next === undefined) throw new Error("Option '--host' requires a package name.");
            hostName = next;
        } else if ((index >= 2) && !boundary && value.startsWith('--host=')) {
            hostName = value.slice('--host='.length);
            if (!hostName) throw new Error("Option '--host' requires a package name.");
        } else if ((index >= 2) && !boundary && (value === '--host-root')) {
            const next = argv[++index];
            if (next === undefined) throw new Error("Option '--host-root' requires a path.");
            hostRoot = next;
        } else if ((index >= 2) && !boundary && value.startsWith('--host-root=')) {
            hostRoot = value.slice('--host-root='.length);
            if (!hostRoot) throw new Error("Option '--host-root' requires a path.");
        } else {
            if ((index >= 2) && !boundary && (value.length > 0) && !value.startsWith('-')) boundary = true;
            result.push(value);
        }
    }
    return {argv: result, dotenvPath, dotenvExplicit, hostName, hostRoot};
}

/**
 * @param {typeof fs} fsApi
 * @param {string} file
 * @param {boolean} explicit
 * @returns {Promise<boolean>}
 */
async function hasDotenvFile(fsApi, file, explicit) {
    if (explicit) return true;
    try {
        await fsApi.stat(file);
        return true;
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return false;
        throw error;
    }
}

/** @param {{applicationRoot?: string, argv: string[], cwd: string, hostSearchRoots?: ReadonlyArray<string>}} params */
export async function launch(params) {
    const globalOptions = extractGlobalOptions(params.argv);
    let applicationRoot;
    if (globalOptions.hostName !== undefined) {
        if (findCommandIdentifier(globalOptions.argv) === undefined) {
            throw new Error('Explicit host mode requires a command identifier after the launcher-global options.');
        }
        applicationRoot = await resolveHostRoot({
            hostName: globalOptions.hostName,
            hostRootInput: globalOptions.hostRoot,
            cwd: params.cwd,
            searchRoots: [...(params.hostSearchRoots ?? []), path.resolve(params.cwd), launcherDir],
        });
    } else {
        if (globalOptions.hostRoot !== undefined) {
            throw new Error("Option '--host-root' requires '--host'.");
        }
        applicationRoot = path.resolve(params.applicationRoot ?? await detectApplicationRoot());
    }
    const launch = Object.freeze({
        argv: Object.freeze([...params.argv]),
        cwd: params.cwd,
        applicationRoot,
    });
    /** @type {ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>} */
    const packages = await new PackageRegistry({fs, path, appRoot: applicationRoot}).build();
    const container = new Container();
    let configurator;
    let configurationSources = [];

    for (const record of packages) {
        const framework = (/** @type {TeqFw_Cli_Manifest_TeqFw} */ (record.packageJson.teqfw ?? {})).fw ?? {};
        for (const item of framework.di?.namespaces ?? []) {
            container.addNamespaceRoot(item.prefix, path.resolve(record.rootAbs, item.path), item.ext ?? '.mjs');
        }
        if (record.rootAbs === applicationRoot) {
            configurator = framework.cli?.container?.configurator;
        }
    }

    if (configurator) {
        const Configurator = (await import(pathToFileURL(path.resolve(applicationRoot, configurator)).href)).default;
        const extensions = await new Configurator().configure({applicationRoot, argv: launch.argv});
        for (const item of extensions?.namespaceRoots ?? []) container.addNamespaceRoot(item.prefix, item.target, item.defaultExt);
        for (const processor of extensions?.preprocessors ?? []) container.addPreprocess(processor);
        for (const processor of extensions?.postprocessors ?? []) container.addPostprocess(processor);
        if (extensions?.logging) container.enableLogging();
        configurationSources = extensions?.configuration?.sources ?? [];
    }

    const dotenvPath = path.resolve(applicationRoot, globalOptions.dotenvPath ?? '.env');
    const dotenvAvailable = await hasDotenvFile(fs, dotenvPath, globalOptions.dotenvExplicit);
    const runtimeConfig = await container.get('TeqFw_Cli_Config$');
    runtimeConfig.init({
        applicationRoot,
        cwd: launch.cwd,
        argv: globalOptions.argv,
        dotenvPath: dotenvAvailable ? dotenvPath : undefined,
        dotenvExplicit: globalOptions.dotenvExplicit,
    });
    const loader = await container.get('TeqFw_Cfg_Loader$');
    const dotenv = await container.get('TeqFw_Cfg_Source_DotenvFile$');
    const processEnv = await container.get('TeqFw_Cfg_Source_ProcessEnv$');
    /** @type {TeqFw_Cfg_Source[]} */
    const sources = [...(configurationSources ?? [])];
    if (dotenvAvailable) sources.push(dotenv.create({path: dotenvPath}));
    sources.push(processEnv.create(process.env));
    await loader.load(sources);

    const bootstrap = await container.get('TeqFw_Cli_Bootstrap$');
    /** @param {string} identifier */
    const resolve = (identifier) => container.get(identifier);
    const commandLaunch = Object.freeze({...launch, argv: Object.freeze([...globalOptions.argv])});
    return bootstrap.start(commandLaunch, resolve);
}

if (await isMainModule()) {
    try {
        process.exitCode = await launch({argv: process.argv, cwd: process.cwd()});
    } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}
