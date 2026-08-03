import assert from 'node:assert/strict';
import test from 'node:test';
import Host from '../../src/Host.mjs';
import Parser from '../../src/Adapter/Parser/Internal.mjs';

const descriptor = {id: 'x:run', path: ['x'], summary: 'x', arguments: [], options: [], component: 'Fixture_Command$'};
const launch = {argv: ['node', 'teq', 'x'], cwd: '.', applicationRoot: '.', version: '1'};

function createHost() {
    let listener;
    const io = {write() {}, error() {}};
    const signals = {subscribe(callback) { listener = callback; return () => {}; }};
    return {host: new Host({parser: new Parser(), signals, io}), signal: (name) => listener(name)};
}

test('host run executes a finite command and reverses plugin shutdown', async () => {
    const calls = [];
    const {host} = createHost();
    const run = host.open({...launch, commands: [descriptor]});
    await run.start({onStartup: async () => calls.push('start'), onShutdown: async () => calls.push('stop')});
    const selection = run.select();
    await run.execute(selection, {id: 'x:run', path: ['x'], summary: 'x', lifetime: 'finite', arguments: [], options: [], execute: async () => calls.push('run')});
    assert.equal(await run.close(), 0);
    assert.deepEqual(calls, ['start', 'run', 'stop']);
});

test('host run closes the successful startup prefix after a startup failure', async () => {
    const calls = [];
    const {host} = createHost();
    const run = host.open({...launch, commands: [descriptor]});
    await run.start({onStartup: async () => calls.push('first:start'), onShutdown: async () => calls.push('first:stop')});
    await assert.rejects(() => run.start({onStartup: async () => { throw new Error('broken'); }, onShutdown: async () => calls.push('second:stop')}));
    assert.equal(await run.close(), 1);
    assert.deepEqual(calls, ['first:start', 'first:stop']);
});

test('host run gives SIGINT priority and closes started plugins', async () => {
    const calls = [];
    const {host, signal} = createHost();
    const run = host.open({...launch, commands: [descriptor]});
    await run.start({onStartup: async () => calls.push('start'), onShutdown: async () => calls.push('stop')});
    signal('SIGINT');
    assert.equal(await run.close(), 130);
    assert.deepEqual(calls, ['start', 'stop']);
});

test('host run rejects malformed long-running command handles', async () => {
    const {host} = createHost();
    const run = host.open({...launch, commands: [descriptor]});
    const selection = run.select();
    await assert.rejects(() => run.execute(selection, {id: 'x:run', path: ['x'], summary: 'x', lifetime: 'long-running', arguments: [], options: [], start: async () => ({})}));
    assert.equal(await run.close(), 1);
});
