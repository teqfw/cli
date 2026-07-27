import assert from 'node:assert/strict';
import test from 'node:test';
import Host from '../../src/Host.mjs';

function createHost(events, signal = undefined) {
    return new Host({
        parser: {select: () => ({kind: 'command', command: {id: 'run', execute: async () => events.push('run')}, args: {}, options: {}})},
        signals: {subscribe(handler) { if (signal) queueMicrotask(() => handler(signal)); return () => events.push('unsubscribe'); }},
        io: {error: (text) => events.push(`error:${text.trim()}`)},
        loggerProvider: {forSource: () => ({debug() {}, info() {}, warn() {}, error() {}})},
    });
}

test('host invokes lifecycle hooks forward then reverse', async () => {
    const events = [];
    const a = {id: 'a', async initialize() { events.push('i:a'); }, async activate() { events.push('a:a'); }, async deactivate() { events.push('d:a'); }, async dispose() { events.push('x:a'); }};
    const b = {id: 'b', async initialize() { events.push('i:b'); }, async activate() { events.push('a:b'); }, async deactivate() { events.push('d:b'); }, async dispose() { events.push('x:b'); }};
    assert.equal(await createHost(events).run({argv: [], version: '1', commands: [], participants: [a, b]}), 0);
    assert.deepEqual(events, ['i:a', 'i:b', 'a:a', 'a:b', 'run', 'd:b', 'd:a', 'x:b', 'x:a', 'unsubscribe']);
});

test('activation failure rolls back activated and initialized participants', async () => {
    const events = [];
    const a = {id: 'a', async initialize() { events.push('i:a'); }, async activate() { events.push('a:a'); }, async deactivate() { events.push('d:a'); }, async dispose() { events.push('x:a'); }};
    const b = {id: 'b', async initialize() { events.push('i:b'); }, async activate() { throw new Error('activate'); }, async dispose() { events.push('x:b'); }};
    assert.equal(await createHost(events).run({argv: [], version: '1', commands: [], participants: [a, b]}), 1);
    assert.deepEqual(events, ['i:a', 'i:b', 'a:a', 'd:a', 'x:b', 'x:a', 'unsubscribe', 'error:activate']);
});

test('first signal aborts once and preserves its process result', async () => {
    const events = [];
    const host = new Host({
        parser: {select: () => ({kind: 'command', command: {id: 'wait', execute: async ({signal}) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), {once: true}))}, args: {}, options: {}})},
        signals: {subscribe(handler) { queueMicrotask(() => { handler('SIGTERM'); handler('SIGINT'); }); return () => events.push('unsubscribe'); }},
        io: {error() {}}, loggerProvider: {forSource: () => ({debug() {}, info() {}, warn() {}, error() {}})},
    });
    assert.equal(await host.run({argv: [], version: '1', commands: [], participants: []}), 143);
    assert.deepEqual(events, ['unsubscribe']);
});
