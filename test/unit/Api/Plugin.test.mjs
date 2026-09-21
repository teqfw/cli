import assert from 'node:assert/strict';
import test from 'node:test';
import Plugin from '../../../src/Api/Plugin.mjs';

test('plugin contract refuses lifecycle calls without an implementation', () => {
    const plugin = new Plugin();

    assert.throws(() => plugin.onStartup(), /is a contract and cannot start a plugin itself/);
    assert.throws(() => plugin.onShutdown(), /is a contract and cannot shut down a plugin itself/);
});
