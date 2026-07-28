// @ts-check

import path from 'node:path';

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function freeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const item of Object.values(value)) freeze(item);
    return Object.freeze(value);
}

function tokens(value, label, packageName) {
    if (value === undefined) return [];
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && /^[A-Za-z][A-Za-z0-9_]*(?:__[A-Za-z][A-Za-z0-9_]*)?\${1,3}$/.test(item))) {
        throw new Error(`${label} in package '${packageName}' must be an array of dependency identifiers.`);
    }
    return value;
}

/**
 * Validates distributed metadata while retaining its intentionally broadcast
 * visibility. Protocol ownership is not an access-control mechanism.
 *
 * @param {ReadonlyArray<any>} packages dependency-first package records
 * @param {string} appRoot head application root
 */
export function collectMetadata(packages, appRoot) {
    const namespaces = [];
    const commandProviders = [];
    const lifecycleProviders = [];
    let configurator;
    let defaultCommand;
    const packageMetadata = {};
    const namespacePrefixes = new Set();
    const providerTokens = new Set();

    for (const record of packages) {
        const metadata = record.packageJson.teqfw;
        if (metadata === undefined) continue;
        if (!isRecord(metadata)) throw new Error(`teqfw metadata in package '${record.name}' must be an object.`);
        const fw = metadata.fw ?? {};
        const pkg = metadata.pkg ?? {};
        if (!isRecord(fw) || !isRecord(pkg)) throw new Error(`teqfw.fw and teqfw.pkg in package '${record.name}' must be objects.`);
        for (const key of Object.keys(pkg)) {
            if (key.length === 0) throw new Error(`teqfw.pkg in package '${record.name}' contains an empty npm package name.`);
        }
        packageMetadata[record.name] = freeze({fw, pkg});

        const di = fw.di ?? {};
        if (!isRecord(di)) throw new Error(`teqfw.fw.di in package '${record.name}' must be an object.`);
        if (di.namespaces !== undefined) {
            if (!Array.isArray(di.namespaces)) throw new Error(`teqfw.fw.di.namespaces in package '${record.name}' must be an array.`);
            for (const raw of di.namespaces) {
                if (!isRecord(raw) || typeof raw.prefix !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*_$/.test(raw.prefix)
                    || typeof raw.path !== 'string' || raw.path.length === 0 || path.isAbsolute(raw.path)
                    || (raw.ext !== undefined && raw.ext !== '.mjs' && raw.ext !== '.js')) {
                    throw new Error(`Invalid teqfw.fw.di.namespaces entry in package '${record.name}'.`);
                }
                if (namespacePrefixes.has(raw.prefix)) throw new Error(`Duplicate namespace prefix '${raw.prefix}'.`);
                const dirAbs = path.resolve(record.rootAbs, raw.path);
                const relative = path.relative(record.rootAbs, dirAbs);
                if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
                    throw new Error(`Namespace path in package '${record.name}' escapes its package root.`);
                }
                namespacePrefixes.add(raw.prefix);
                namespaces.push(Object.freeze({prefix: raw.prefix, dirAbs, ext: raw.ext ?? '.mjs', packageName: record.name}));
            }
        }

        const cli = fw.cli ?? {};
        if (!isRecord(cli)) throw new Error(`teqfw.fw.cli in package '${record.name}' must be an object.`);
        const isHead = path.resolve(record.rootAbs) === path.resolve(appRoot);
        if (cli.container !== undefined) {
            if (!isHead) throw new Error(`Only the head application may declare teqfw.fw.cli.container.`);
            if (!isRecord(cli.container) || typeof cli.container.configurator !== 'string' || cli.container.configurator.length === 0 || path.isAbsolute(cli.container.configurator)) {
                throw new Error('teqfw.fw.cli.container.configurator must be a non-empty application-relative module path.');
            }
            if (configurator !== undefined) throw new Error('Conflicting head-application container configurators.');
            configurator = cli.container.configurator;
        }
        if (cli.command !== undefined) {
            if (!isHead) throw new Error(`Only the head application may declare teqfw.fw.cli.command.`);
            if (!isRecord(cli.command) || (cli.command.default !== undefined && (typeof cli.command.default !== 'string' || cli.command.default.length === 0))) {
                throw new Error('teqfw.fw.cli.command.default must be a non-empty command id.');
            }
            if (cli.command.default !== undefined) {
                if (defaultCommand !== undefined) throw new Error('Conflicting head-application default commands.');
                defaultCommand = cli.command.default;
            }
        }
        for (const [label, target] of [['commands', commandProviders], ['lifecycle', lifecycleProviders]]) {
            for (const token of tokens(cli[label], `teqfw.fw.cli.${label}`, record.name)) {
                if (providerTokens.has(`${label}:${token}`)) throw new Error(`Duplicate ${label} provider '${token}'.`);
                providerTokens.add(`${label}:${token}`);
                target.push(token);
            }
        }
    }
    if (configurator === undefined) throw new Error('The head application must declare teqfw.fw.cli.container.configurator.');
    return freeze({
        packages: packages.map((record) => Object.freeze({name: record.name, rootAbs: record.rootAbs, packageJson: record.packageJson})),
        byPackage: packageMetadata,
        namespaces,
        cli: {configurator, defaultCommand, commandProviders, lifecycleProviders},
    });
}
