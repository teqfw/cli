import assert from 'node:assert/strict';
import test from 'node:test';
import {launch} from '../../bin/teq.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('launches with a configurator', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture', 'finite'], cwd: fixture.root, version: '0.1.0'});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureConfigurator, fixture.root);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'metadata'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'packages'), false);
    } finally {
        delete globalThis.__fixtureConfigurator;
        delete globalThis.__fixtureLaunch;
        await fixture.cleanup();
    }
});

test('launches without a configurator', async () => {
    const fixture = await createCliFixture({configurator: false});
    try {
        const result = await launch({applicationRoot: fixture.root, argv: ['node', 'teq', 'fixture', 'finite'], cwd: fixture.root, version: '0.1.0'});
        assert.equal(result, 0);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'metadata'), false);
        assert.equal(Object.hasOwn(globalThis.__fixtureLaunch, 'packages'), false);
    } finally {
        delete globalThis.__fixtureLaunch;
        await fixture.cleanup();
    }
});
