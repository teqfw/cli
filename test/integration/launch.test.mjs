import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import {launch} from '../../bin/teq.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('launches with a configurator', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureConfigurator, fixture.root);
        assert.deepEqual(globalThis.__fixturePluginConfig, {VALUE: 'ready'});
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'ready'});
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'metadata'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'packages'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'commandProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'lifecycleProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'defaultCommand'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'resolve'), false);
        assert.deepEqual(globalThis.__fixtureCalls, ['plugin:start', 'command:finite:create', 'command:finite:run', 'plugin:stop']);
    } finally {
        delete globalThis.__fixtureConfigurator;
        delete globalThis.__fixtureConfiguratorArgv;
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCommandConfig;
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('launches without a configurator or CLI plugin component', async () => {
    const fixture = await createCliFixture({configurator: false, plugin: false});
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'metadata'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'packages'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'commandProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'lifecycleProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'defaultCommand'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'resolve'), false);
        assert.deepEqual(globalThis.__fixtureCalls, ['command:finite:create', 'command:finite:run']);
    } finally {
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('information starts and closes plugins without creating commands', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'help'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixtureCalls, ['plugin:start', 'plugin:stop']);
        assert.equal(globalThis.__fixtureLaunch, undefined);
    } finally {
        delete globalThis.__fixtureConfigurator;
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('reports the host application version', async () => {
    const fixture = await createCliFixture();
    const write = process.stdout.write;
    let output = '';
    process.stdout.write = (chunk) => { output += String(chunk); return true; };
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'version'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(output, '1.2.3\n');
    } finally {
        process.stdout.write = write;
        delete globalThis.__fixtureConfigurator;
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('loads configuration before resolving plugins and commands', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixturePluginConfig, {VALUE: 'ready'});
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'ready'});
    } finally {
        delete globalThis.__fixtureConfigurator;
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCommandConfig;
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('loads the application .env and gives process.env highest precedence', async () => {
    const fixture = await createCliFixture();
    const key = 'TEQFW_FIXTURE__VALUE';
    const before = process.env[key];
    await fs.writeFile(path.join(fixture.root, '.env'), `${key}=dotenv\n`);
    process.env[key] = 'environment';
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixturePluginConfig, {VALUE: 'environment'});
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'environment'});
    } finally {
        if (before === undefined) delete process.env[key];
        else process.env[key] = before;
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCommandConfig;
        delete globalThis.__fixtureCalls;
        delete globalThis.__fixtureLaunch;
        await fixture.cleanup();
    }
});

test('loads an explicit dotenv file and removes the global option before command parsing', async () => {
    const fixture = await createCliFixture();
    await fs.writeFile(path.join(fixture.root, 'selected.env'), 'TEQFW_FIXTURE__VALUE=explicit\n');
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite', '--dotenv-file=selected.env'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixturePluginConfig, {VALUE: 'explicit'});
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'explicit'});
        assert.deepEqual(globalThis.__fixtureConfiguratorArgv, ['node', 'teq', 'fixture:finite', '--dotenv-file=selected.env']);
        assert.deepEqual(globalThis.__fixtureLaunch.argv, ['node', 'teq', 'fixture:finite']);
    } finally {
        delete globalThis.__fixtureConfiguratorArgv;
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCommandConfig;
        delete globalThis.__fixtureLaunch;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('dotenv overrides host defaults when process.env does not define the key', async () => {
    const fixture = await createCliFixture();
    const key = 'TEQFW_FIXTURE__VALUE';
    const before = process.env[key];
    delete process.env[key];
    await fs.writeFile(path.join(fixture.root, '.env'), key + '=dotenv\n');
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixturePluginConfig, {VALUE: 'dotenv'});
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'dotenv'});
    } finally {
        if (before === undefined) delete process.env[key];
        else process.env[key] = before;
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCommandConfig;
        delete globalThis.__fixtureCalls;
        delete globalThis.__fixtureLaunch;
        await fixture.cleanup();
    }
});

test('missing explicit dotenv file fails before plugin resolution', async () => {
    const fixture = await createCliFixture();
    try {
        await assert.rejects(
            launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite', '--dotenv-file', 'missing.env'], cwd: fixture.root}),
            (error) => error instanceof Error && error.name === 'CfgError',
        );
        assert.equal(globalThis.__fixturePluginConfig, undefined);
        assert.equal(globalThis.__fixtureCalls, undefined);
    } finally {
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});

test('configuration failure prevents plugin resolution', async () => {
    const fixture = await createCliFixture();
    await fs.writeFile(path.join(fixture.root, 'src/Bootstrap/Container.mjs'), `/** @implements {TeqFw_Cli_Api_Container_Configurator} */
export default class Container {
    configure() {
        return {configuration: {sources: [{id: 'failing', load: async () => { throw new Error('fixture configuration failure'); }}]}};
    }
}
`);
    try {
        await assert.rejects(launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture:finite'], cwd: fixture.root}), (error) => error instanceof Error && error.name === 'CfgError');
        assert.equal(globalThis.__fixturePluginConfig, undefined);
        assert.equal(globalThis.__fixtureCalls, undefined);
    } finally {
        delete globalThis.__fixturePluginConfig;
        delete globalThis.__fixtureCalls;
        await fixture.cleanup();
    }
});
