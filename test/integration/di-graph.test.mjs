import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di/src/Container.mjs';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';
import PackageGraph from '../../src/Infra/PackageGraph.mjs';
import ProviderRegistry from '../../src/Registry/Provider.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('real DI 2.x resolves the complete provider graph after namespace configuration', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const namespaceRegistry = new NamespaceRegistry({fs, path, appRoot: fixture.root});
    const packageGraph = new PackageGraph({fs, path, appRoot: fixture.root});
    const providerRegistry = new ProviderRegistry({packageGraph});
    const container = new Container();

    const entries = await namespaceRegistry.build();
    for (const entry of entries) container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
    const tokens = await providerRegistry.build();
    const providers = [];
    for (const token of tokens) providers.push(await container.get(token));
    const registry = await container.get('TeqFw_Cli_Registry_Command$');
    const commands = registry.build(Object.freeze(providers));

    assert.deepEqual(commands.map((command) => command.id), [
        'fixture:echo',
        'fixture:fail',
        'fixture:wait',
        'beta:ping',
        'alpha:ping',
        'transitive:ping',
    ]);
    assert.equal(Object.isFrozen(commands), true);
    assert.equal(typeof (await container.get('TeqFw_Cli_Runner$$')).run, 'function');

    const parser = await container.get('TeqFw_Cli_Adapter_Parser_Commander$$');
    let typed;
    await parser.parse({
        commands,
        argv: ['node', 'teq', 'fixture', 'echo', '7', 'false', '--label', 'integration', '--tag', '4'],
        version: '0.1.0',
        io: {write() {}, error() {}},
        async onExecute(command, args, options) {
            typed = {id: command.id, args, options};
        },
    });
    assert.deepEqual(typed, {
        id: 'fixture:echo',
        args: {count: 7, enabled: false},
        options: {label: 'integration', tag: [4], verbose: undefined},
    });
});

test('bootstrap boundary performs all configuration and metadata work before first resolution', async () => {
    const {default: Bootstrap} = await import('../../src/Bootstrap.mjs');
    const calls = [];
    let metadataReady = false;
    const provider = {getCommands: () => Object.freeze([])};
    const runner = {run: async () => 0};
    const container = {
        addNamespaceRoot(prefix) {
            calls.push(`namespace:${prefix}`);
        },
        async get(token) {
            assert.equal(metadataReady, true);
            assert.equal(calls[0], 'namespace:Fixture_');
            calls.push(`get:${token}`);
            if (token === 'Fixture_Provider$') return provider;
            if (token === 'TeqFw_Cli_Registry_Command$') return {build: () => Object.freeze([])};
            if (token === 'TeqFw_Cli_Runner$$') return runner;
            throw new Error(`Unexpected token ${token}`);
        },
    };
    const bootstrap = new Bootstrap({
        namespaceRegistry: {build: async () => [{prefix: 'Fixture_', dirAbs: '/fixture', ext: '.mjs'}]},
        providerRegistry: {
            async build() {
                metadataReady = true;
                return ['Fixture_Provider$'];
            },
        },
        container,
        io: {error() {}},
    });

    assert.equal(await bootstrap.run({argv: [], version: '0.1.0'}), 0);
    assert.deepEqual(calls, [
        'namespace:Fixture_',
        'get:Fixture_Provider$',
        'get:TeqFw_Cli_Registry_Command$',
        'get:TeqFw_Cli_Runner$$',
    ]);
});
