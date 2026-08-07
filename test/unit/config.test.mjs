import assert from 'node:assert/strict';
import test from 'node:test';
import Config from '../../src/Config.mjs';
import deepFreeze from '../../src/Util/DeepFreeze.mjs';

test('runtime config is unavailable until initialized and immutable afterwards', () => {
    const config = new Config({deep: deepFreeze});
    assert.throws(() => config.applicationRoot, /not initialized/);
    config.init({
        applicationRoot: '/app',
        cwd: '/work',
        argv: ['node', 'teq', 'run'],
        dotenvPath: '/app/.env',
        dotenvExplicit: false,
    });
    assert.deepEqual({...config}, {
        applicationRoot: '/app',
        cwd: '/work',
        argv: ['node', 'teq', 'run'],
        dotenvPath: '/app/.env',
        dotenvExplicit: false,
    });
    assert(Object.isFrozen(config));
    assert(Object.isFrozen(config.argv));
    assert.throws(() => config.init(/** @type {any} */ ({})), /already initialized/);
    assert.throws(() => /** @type {string[]} */ (config.argv).push('extra'), TypeError);
});
