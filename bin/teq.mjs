#!/usr/bin/env node
// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import Container from '@teqfw/di';
import PackageRegistry from '@teqfw/di/node/registry/package';

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
 * @param {ReadonlyArray<string>} argv
 * @returns {{argv: string[], dotenvPath: string|undefined, dotenvExplicit: boolean}}
 */
function extractGlobalOptions(argv) {
    const result = [];
    let dotenvPath;
    let dotenvExplicit = false;
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
        } else result.push(value);
    }
    return {argv: result, dotenvPath, dotenvExplicit};
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

/** @param {{applicationRoot?: string, argv: string[], cwd: string}} params */
export async function launch(params) {
    const applicationRoot = params.applicationRoot ?? await detectApplicationRoot();
    const globalOptions = extractGlobalOptions(params.argv);
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
    const loader = await container.get('TeqFw_Cfg_Loader$');
    const dotenv = await container.get('TeqFw_Cfg_Source_DotenvFile$');
    const processEnv = await container.get('TeqFw_Cfg_Source_ProcessEnv$');
    /** @type {TeqFw_Cfg_Source[]} */
    const sources = [...(configurationSources ?? [])];
    if (await hasDotenvFile(fs, dotenvPath, globalOptions.dotenvExplicit)) sources.push(dotenv.create({path: dotenvPath}));
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
