import assert from 'node:assert/strict';
import test from 'node:test';
import Signal from '../../../src/Adapter/Signal.mjs';

test('signal adapter forwards signals and unsubscribes both handlers once', () => {
    /** @type {Map<string, () => void>} */ const handlers = new Map();
    /** @type {[string, () => void][]} */ const removed = [];
    const processModule = {default: {
        /** @param {string} name @param {() => void} handler */ on(name, handler) { handlers.set(name, handler); },
        /** @param {string} name @param {() => void} handler */ off(name, handler) { removed.push([name, handler]); handlers.delete(name); },
    }};
    /** @type {string[]} */ const received = [];
    const unsubscribe = new Signal({processModule}).subscribe((signal) => received.push(signal));

    const onInt = handlers.get('SIGINT');
    const onTerm = handlers.get('SIGTERM');
    assert.ok(onInt);
    assert.ok(onTerm);
    onInt();
    onTerm();
    unsubscribe();
    unsubscribe();

    assert.deepEqual(received, ['SIGINT', 'SIGTERM']);
    assert.deepEqual(removed.map(([name]) => name), ['SIGINT', 'SIGTERM']);
    assert.equal(handlers.size, 0);
});
