#!/usr/bin/env node
// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import Container from '@teqfw/di';
import PackageRegistry from '@teqfw/di/node/registry/package';

/** @param {{applicationRoot?: string, argv: string[], cwd: string, version: string}} params */
export async function launch(params) {
    const applicationRoot = params.applicationRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
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
        version: params.version,
    }, resolve);
}

if (import.meta.main) {
    try {
        process.exitCode = await launch({argv: process.argv, cwd: process.cwd(), version: '0.1.0'});
    } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}
