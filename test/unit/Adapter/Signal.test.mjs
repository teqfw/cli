import assert from 'node:assert/strict';
import test from 'node:test';
import Signal from '../../../src/Adapter/Signal.mjs';

test('signal adapter forwards signals and unsubscribes both handlers once', () => {
    const handlers = new Map();
    const removed = [];
    const processModule = {default: {
        on(name, handler) { handlers.set(name, handler); },
        off(name, handler) { removed.push([name, handler]); handlers.delete(name); },
    }};
    const received = [];
    const unsubscribe = new Signal({processModule}).subscribe((signal) => received.push(signal));

    handlers.get('SIGINT')();
    handlers.get('SIGTERM')();
    unsubscribe();
    unsubscribe();

    assert.deepEqual(received, ['SIGINT', 'SIGTERM']);
    assert.deepEqual(removed.map(([name]) => name), ['SIGINT', 'SIGTERM']);
    assert.equal(handlers.size, 0);
});
