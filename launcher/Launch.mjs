// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import Container from '@teqfw/di';
import PackageRegistry from '@teqfw/di/node/registry/package';
import {pathToFileURL} from 'node:url';
import {discoverHeadApplication} from './HeadApplication.mjs';
import {collectMetadata} from './Metadata.mjs';
import {loadConfigurator} from './Configurator.mjs';

async function createLog(packages) {
    const record = packages.find((item) => item.name === '@teqfw/log');
    if (!record) throw new Error('@teqfw/log must be a production dependency of the head application.');
    const base = pathToFileURL(path.join(record.rootAbs, 'src')).href;
    const [provider, levels, loggerModule, recordFactory, writer] = await Promise.all([
        import(base + '/Provider.mjs'), import(base + '/Enum/Level.mjs'), import(base + '/Logger.mjs'),
        import(base + '/Record/Factory.mjs'), import(base + '/Console/Writer.mjs'),
    ]);
    return new provider.default({levels, loggerModule: loggerModule.default, recordFactory: new recordFactory.default(), writer: new writer.default()});
}

function freeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const item of Object.values(value)) freeze(item);
    return Object.freeze(value);
}

/** @param {{argv: string[], cwd: string, version: string, io: {error(message: string): void}}} input */
export async function launch(input) {
    const head = await discoverHeadApplication(input.cwd);
    const packages = await new PackageRegistry({fs, path, appRoot: head.root}).build();
    const metadata = collectMetadata(packages, head.root);
    const loggerProvider = await createLog(packages);
    const configuratorInput = freeze({
        applicationRoot: head.root,
        cwd: input.cwd,
        argv: [...input.argv],
        applicationManifest: head.manifest,
        packages: metadata.packages,
        metadata,
        invocation: freeze({argv: input.argv.slice(2)}),
        services: freeze({}),
    });
    const extensions = await loadConfigurator(configuratorInput);
    const container = new Container();
    for (const entry of metadata.namespaces) {
        let stat;
        try { stat = await fs.stat(entry.dirAbs); } catch (cause) { throw new Error(`Namespace path for '${entry.prefix}' is not readable.`, {cause}); }
        if (!stat.isDirectory()) throw new Error(`Namespace path for '${entry.prefix}' is not a directory.`);
        container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
    }
    for (const processor of extensions.preprocessors) container.addPreprocess(processor);
    for (const processor of extensions.postprocessors) container.addPostprocess(processor);
    const bootstrap = await container.get('TeqFw_Cli_Bootstrap$');
    if (!bootstrap || typeof bootstrap.start !== 'function') throw new Error('TeqFw_Cli_Bootstrap$ must expose start().');
    const launchContext = freeze({
        argv: [...input.argv], cwd: input.cwd, applicationRoot: head.root,
        applicationManifest: head.manifest, packages: metadata.packages, metadata,
        version: input.version,
        log: loggerProvider.forSource('TeqFw_Cli_Launch'),
        shutdown: freeze({}),
        resolve: (identifier) => container.get(identifier),
    });
    return await bootstrap.start(launchContext);
}
