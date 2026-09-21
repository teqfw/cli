import assert from 'node:assert/strict';
import test from 'node:test';
import Bootstrap from '../../src/Bootstrap.mjs';

function createBootstrap({packages, selection = {kind: 'command', command: {component: 'Fixture_Command$'}}, interrupted = false}) {
    const calls = [];
    const run = {
        async start(plugin) { calls.push(['start', plugin]); },
        select() { calls.push(['select']); return selection; },
        async execute(selected, command) { calls.push(['execute', selected, command]); },
        async close(status) { calls.push(['close', status]); return status ?? 0; },
        fail(error) { calls.push(['fail', error]); },
        isInterrupted() { return interrupted; },
    };
    class PackageRegistry {
        async build() { return packages; }
    }
    const bootstrap = new Bootstrap(/** @type {any} */ ({
        host: {open(input) { calls.push(['open', input]); return run; }},
        commandRegistry: {build(items) { calls.push(['build', items]); return Object.freeze(items); }},
        commandFactory: {create(data) { calls.push(['create', data]); return data; }},
        packageRegistry: PackageRegistry, fs: {}, path: {},
    }));
    return {bootstrap, calls};
}

const application = {
    rootAbs: '/app',
    packageJson: {version: '1.2.3', teqfw: {fw: {cli: {
        command: {default: 'fixture:run'},
        commands: [{id: 'fixture:run', summary: 'Run fixture', component: 'Fixture_Command$'}],
        plugin: 'Fixture_Plugin$',
    }}}},
};

test('bootstrap resolves plugins before the selected command and closes a successful run', async () => {
    const {bootstrap, calls} = createBootstrap({packages: [application]});
    const resolved = [];
    const plugin = {onStartup: async () => {}};
    const command = {id: 'fixture:run', lifetime: 'finite', execute: async () => {}};

    const status = await bootstrap.start(/** @type {any} */ ({applicationRoot: '/app', argv: ['node', 'teq', 'fixture:run']}), async (identifier) => {
        resolved.push(identifier);
        return identifier === 'Fixture_Plugin$' ? plugin : command;
    });

    assert.equal(status, 0);
    assert.deepEqual(resolved, ['Fixture_Plugin$', 'Fixture_Command$']);
    assert.deepEqual(calls.map(([name]) => name), ['build', 'open', 'start', 'select', 'create', 'execute', 'close']);
    assert.equal(calls[1][1].version, '1.2.3');
    assert.equal(calls.at(-1)[1], 0);
});

test('bootstrap rejects retired lifecycle metadata before opening a host run', async () => {
    const legacy = {rootAbs: '/app', packageJson: {name: 'fixture', teqfw: {fw: {cli: {lifecycle: ['Fixture_Legacy$']}}}}};
    const {bootstrap, calls} = createBootstrap({packages: [legacy]});

    await assert.rejects(
        () => bootstrap.start(/** @type {any} */ ({applicationRoot: '/app', argv: []}), async () => { throw new Error('must not resolve'); }),
        /declares retired 'teqfw\.fw\.cli\.lifecycle'/,
    );
    assert.deepEqual(calls.map(([name]) => name), []);
});
