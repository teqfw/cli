import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {launch} from '../../bin/teq.mjs';
import {clearCliFixtureGlobals, createCliFixture} from '../helper/fixture.mjs';

async function run(argv, options = {}) {
    return launch({argv, cwd: options.cwd, hostSearchRoots: options.hostSearchRoots});
}

/** Builds a fake global npm root that contains the fixture host as a top-level installed package. */
async function makeGlobalRoot(hostRoot) {
    const globalRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-global-'));
    const hostDir = path.join(globalRoot, 'node_modules', 'fixture-app');
    await fs.mkdir(path.dirname(hostDir), {recursive: true});
    await fs.symlink(hostRoot, hostDir, 'dir');
    return {
        globalRoot,
        hostDir,
        async cleanup() { await fs.rm(globalRoot, {recursive: true, force: true}); },
    };
}

/** Extends the fixture host with a command that exposes its positional input and runtime facts. */
async function addEchoCommand(root) {
    const manifestPath = path.join(root, 'package.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    manifest.teqfw.fw.cli.commands.push({
        id: 'fixture:echo',
        summary: 'Echo',
        arguments: [{name: 'target', kind: 'string', required: true, description: 'Echo input.'}],
        options: [],
        component: 'Fixture_App_Cli_Command_Echo$',
    });
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    const echoPath = path.join(root, 'src/Cli/Command/Echo.mjs');
    await fs.mkdir(path.dirname(echoPath), {recursive: true});
    await fs.writeFile(echoPath, `export default class Echo { constructor({config}) { return {id: 'fixture:echo', summary: 'Echo', lifetime: 'finite', arguments: [{name: 'target', kind: 'string', required: true, description: 'Echo input.'}], options: [], execute: async ({args}) => { globalThis.__fixtureEchoTarget = args.target; globalThis.__fixtureEchoRoot = config.applicationRoot; globalThis.__fixtureEchoCwd = config.cwd; }}; } }\nexport const __deps__ = Object.freeze({default: Object.freeze({config: 'TeqFw_Cli_Config$'})});\n`);
}

function clearEchoGlobals() {
    delete globalThis.__fixtureEchoTarget;
    delete globalThis.__fixtureEchoRoot;
    delete globalThis.__fixtureEchoCwd;
}

test('explicit host runs a command through --host-root', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', '--host-root', fixture.root, 'fixture:finite'], {cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureConfigurator, fixture.root);
        assert.equal(globalThis.__fixtureCommandRuntimeConfig.root, fixture.root);
        assert.deepEqual(globalThis.__fixtureCalls, ['plugin:start', 'command:finite:create', 'command:finite:run', 'plugin:stop']);
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('explicit host accepts equals-form launcher options', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await run(['node', 'teq', `--host=fixture-app`, `--host-root=${fixture.root}`, 'fixture:finite'], {cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureCommandRuntimeConfig.root, fixture.root);
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('--host resolves the host through a global search root', async () => {
    const fixture = await createCliFixture();
    const global = await makeGlobalRoot(fixture.root);
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-cwd-'));
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', 'fixture:finite'], {cwd, hostSearchRoots: [global.globalRoot]});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureConfigurator, global.hostDir);
        assert.equal(globalThis.__fixtureCommandRuntimeConfig.root, global.hostDir);
        assert.equal(globalThis.__fixtureCommandRuntimeConfig.cwd, cwd);
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await global.cleanup();
        await fs.rm(cwd, {recursive: true, force: true});
    }
});

test('command input stays relative to the original cwd while the host graph is elsewhere', async () => {
    const fixture = await createCliFixture();
    await addEchoCommand(fixture.root);
    const global = await makeGlobalRoot(fixture.root);
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-cwd-'));
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', 'fixture:echo', './ctx'], {cwd, hostSearchRoots: [global.globalRoot]});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureEchoTarget, './ctx');
        assert.equal(globalThis.__fixtureEchoRoot, global.hostDir);
        assert.equal(globalThis.__fixtureEchoCwd, cwd);
    } finally {
        clearCliFixtureGlobals();
        clearEchoGlobals();
        await fixture.cleanup();
        await global.cleanup();
        await fs.rm(cwd, {recursive: true, force: true});
    }
});

test('launcher-global parsing stops at the command identifier', async () => {
    const fixture = await createCliFixture();
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', '--host-root', fixture.root, 'fixture:finite', '--host-root', '/fake'], {cwd: fixture.root});
        assert.equal(result, 2);
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('dotenv loads from the explicit host root, not the working directory', async () => {
    const fixture = await createCliFixture();
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-cwd-'));
    const key = 'TEQFW_FIXTURE__VALUE';
    const before = process.env[key];
    delete process.env[key];
    await fs.writeFile(path.join(fixture.root, '.env'), `${key}=dotenv\n`);
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', '--host-root', fixture.root, 'fixture:finite'], {cwd});
        assert.equal(result, 0);
        assert.deepEqual(globalThis.__fixtureCommandConfig, {VALUE: 'dotenv'});
    } finally {
        if (before === undefined) delete process.env[key];
        else process.env[key] = before;
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await fs.rm(cwd, {recursive: true, force: true});
    }
});

test('--host resolves through the active npm global root from npm_config_prefix', async () => {
    const fixture = await createCliFixture();
    const prefix = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-prefix-'));
    const hostDir = path.join(prefix, 'lib', 'node_modules', 'fixture-app');
    await fs.mkdir(path.dirname(hostDir), {recursive: true});
    await fs.symlink(fixture.root, hostDir, 'dir');
    const before = process.env.npm_config_prefix;
    process.env.npm_config_prefix = prefix;
    try {
        const result = await run(['node', 'teq', '--host', 'fixture-app', 'fixture:finite'], {cwd: fixture.root});
        assert.equal(result, 0);
        assert.equal(globalThis.__fixtureConfigurator, hostDir);
    } finally {
        if (before === undefined) delete process.env.npm_config_prefix;
        else process.env.npm_config_prefix = before;
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await fs.rm(prefix, {recursive: true, force: true});
    }
});

test('--host-root without --host is rejected', async () => {
    const fixture = await createCliFixture();
    try {
        await assert.rejects(
            run(['node', 'teq', '--host-root', fixture.root, 'fixture:finite'], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes("Option '--host-root' requires '--host'."),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('host root package-name mismatch is rejected', async () => {
    const fixture = await createCliFixture();
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'wrong-name', '--host-root', fixture.root, 'fixture:finite'], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes('does not match'),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('invalid host root is rejected', async () => {
    const fixture = await createCliFixture();
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'fixture-app', '--host-root', path.join(fixture.root, 'missing'), 'fixture:finite'], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes('Unable to read package manifest'),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('explicit host without canonical namespaces is rejected', async () => {
    const fixture = await createCliFixture();
    const bad = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-bad-'));
    await fs.writeFile(path.join(bad, 'package.json'), JSON.stringify({
        name: 'fixture-app', version: '1.0.0', type: 'module',
        dependencies: {'@teqfw/cli': '2'},
        teqfw: {fw: {cli: {commands: []}}},
    }, null, 2));
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'fixture-app', '--host-root', bad, 'fixture:finite'], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes('does not declare a usable TeqFW host manifest'),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await fs.rm(bad, {recursive: true, force: true});
    }
});

test('explicit host without the @teqfw/cli dependency is rejected', async () => {
    const fixture = await createCliFixture();
    const bad = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-bad-'));
    await fs.writeFile(path.join(bad, 'package.json'), JSON.stringify({
        name: 'fixture-app', version: '1.0.0', type: 'module',
        dependencies: {'@teqfw/di': '2'},
        teqfw: {fw: {di: {namespaces: [{prefix: 'Fixture_App_', path: './src'}]}}},
    }, null, 2));
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'fixture-app', '--host-root', bad, 'fixture:finite'], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes("must declare '@teqfw/cli'"),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await fs.rm(bad, {recursive: true, force: true});
    }
});

test('missing selected host produces a clear error', async () => {
    const fixture = await createCliFixture();
    const empty = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-empty-'));
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'no-such-package', 'fixture:finite'], {cwd: fixture.root, hostSearchRoots: [empty]}),
            (error) => error instanceof Error && error.message.includes('is not found in the local application or the global npm module locations'),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
        await fs.rm(empty, {recursive: true, force: true});
    }
});

test('explicit host requires a command identifier', async () => {
    const fixture = await createCliFixture();
    try {
        await assert.rejects(
            run(['node', 'teq', '--host', 'fixture-app', '--host-root', fixture.root], {cwd: fixture.root}),
            (error) => error instanceof Error && error.message.includes('requires a command identifier'),
        );
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});
