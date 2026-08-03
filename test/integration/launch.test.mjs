import assert from 'node:assert/strict';
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
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'metadata'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'packages'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'commandProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'lifecycleProviders'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'defaultCommand'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'resolve'), false);
        assert.deepEqual(globalThis.__fixtureCalls, ['plugin:start', 'command:finite:create', 'command:finite:run', 'plugin:stop']);
    } finally {
        delete globalThis.__fixtureConfigurator;
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
