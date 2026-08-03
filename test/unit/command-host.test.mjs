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

test('host session runs a finite command and reverses plugin shutdown', async () => {
    const calls = [];
    const {host} = createHost();
    const session = host.open({...launch, commands: [descriptor]});
    await session.start({onStartup: async () => calls.push('start'), onShutdown: async () => calls.push('stop')});
    const selection = session.select();
    await session.execute(selection, {id: 'x:run', path: ['x'], summary: 'x', lifetime: 'finite', arguments: [], options: [], execute: async () => calls.push('run')});
    assert.equal(await session.close(), 0);
    assert.deepEqual(calls, ['start', 'run', 'stop']);
});

test('host session closes the successful startup prefix after a startup failure', async () => {
    const calls = [];
    const {host} = createHost();
    const session = host.open({...launch, commands: [descriptor]});
    await session.start({onStartup: async () => calls.push('first:start'), onShutdown: async () => calls.push('first:stop')});
    await assert.rejects(() => session.start({onStartup: async () => { throw new Error('broken'); }, onShutdown: async () => calls.push('second:stop')}));
    assert.equal(await session.close(), 1);
    assert.deepEqual(calls, ['first:start', 'first:stop']);
});

test('host session gives SIGINT priority and closes started plugins', async () => {
    const calls = [];
    const {host, signal} = createHost();
    const session = host.open({...launch, commands: [descriptor]});
    await session.start({onStartup: async () => calls.push('start'), onShutdown: async () => calls.push('stop')});
    signal('SIGINT');
    assert.equal(await session.close(), 130);
    assert.deepEqual(calls, ['start', 'stop']);
});

test('host session rejects malformed long-running command handles', async () => {
    const {host} = createHost();
    const session = host.open({...launch, commands: [descriptor]});
    const selection = session.select();
    await assert.rejects(() => session.execute(selection, {id: 'x:run', path: ['x'], summary: 'x', lifetime: 'long-running', arguments: [], options: [], start: async () => ({})}));
    assert.equal(await session.close(), 1);
});
