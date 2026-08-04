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

/** @param {{applicationRoot?: string, argv: string[], cwd: string}} params */
export async function launch(params) {
    const applicationRoot = params.applicationRoot ?? await detectApplicationRoot();
    /** @type {ReadonlyArray<TeqFw_Di_Node_Registry_Package_Record>} */
    const packages = await new PackageRegistry({fs, path, appRoot: applicationRoot}).build();
    const container = new Container();
    let configurator;

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
        const extensions = await new Configurator().configure({applicationRoot, argv: params.argv});
        for (const item of extensions?.namespaceRoots ?? []) container.addNamespaceRoot(item.prefix, item.target, item.defaultExt);
        for (const processor of extensions?.preprocessors ?? []) container.addPreprocess(processor);
        for (const processor of extensions?.postprocessors ?? []) container.addPostprocess(processor);
        if (extensions?.logging) container.enableLogging();
    }

    const bootstrap = await container.get('TeqFw_Cli_Bootstrap$');
    /** @param {string} identifier */
    const resolve = (identifier) => container.get(identifier);
    return bootstrap.start({
        argv: params.argv,
        cwd: params.cwd,
        applicationRoot,
    }, resolve);
}

if (await isMainModule()) {
    try {
        process.exitCode = await launch({argv: process.argv, cwd: process.cwd()});
    } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}
