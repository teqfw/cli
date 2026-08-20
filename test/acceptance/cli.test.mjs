import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createCliFixture} from '../helper/fixture.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

function run(binary, args, cwd, options = {}) {
    const child = spawn(binary, args, {cwd, ...options});
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    return new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', (code) => resolve({code, stdout, stderr}));
    });
}

test('teq npm launcher supports help, arbitrary cwd, default command, usage errors, and SIGINT shutdown', async () => {
    const fixture = await createCliFixture();
    try {
        const version = await run(fixture.launcher, ['version'], fixture.root);
        assert.equal(version.code, 0);
        assert.equal(version.stdout, '1.2.3\n');
        const selected = path.join(fixture.root, 'selected.env');
        await fs.writeFile(selected, 'TEQFW_FIXTURE__VALUE=selected\n');
        const dotenvResult = await run(fixture.launcher, ['fixture:finite', '--dotenv-file=' + selected], fixture.root);
        assert.equal(dotenvResult.code, 0);
        assert.match(dotenvResult.stdout, /"root"/);
        const nested = path.join(fixture.root, 'nested');
        await fs.mkdir(nested);
        const nestedResult = await run(fixture.launcher, ['fixture:finite'], nested);
        assert.equal(nestedResult.code, 0);
        assert.match(nestedResult.stdout, /"root"/);
        const defaultResult = await run(fixture.launcher, [], fixture.root);
        assert.equal(defaultResult.code, 0);
        assert.match(defaultResult.stdout, /"cwd"/);
        const missing = await run(fixture.launcher, ['missing'], fixture.root);
        assert.equal(missing.code, 2);
        const legacy = await run(fixture.launcher, ['fixture', 'finite'], fixture.root);
        assert.equal(legacy.code, 2);
        const child = spawn(fixture.launcher, ['fixture:wait'], {cwd: fixture.root});
        let output = '';
        let sent = false;
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
            output += data;
            if (!sent && output.includes('started\n')) {
                sent = true;
                child.kill('SIGINT');
            }
        });
        const result = await new Promise((resolve, reject) => {
            child.once('error', reject);
            child.once('exit', (code) => resolve(code));
        });
        assert.equal(result, 130);
    } finally {
        await fixture.cleanup();
    }
});

test('teq npm launcher starts when invoked by a node:test worker', async () => {
    const fixture = await createCliFixture();
    try {
        const help = await run(fixture.launcher, ['help'], fixture.root);
        assert.equal(help.code, 0);
        assert.match(help.stdout, /TeqFW application launcher/);
        assert.match(help.stdout, /fixture:finite/);
        assert.doesNotMatch(help.stdout, /fixture finite/);
    } finally {
        await fixture.cleanup();
    }
});

test('teq source checkout uses its package root', async () => {
    const result = await run(process.execPath, [path.join(projectRoot, 'bin/teq.mjs'), '--help'], projectRoot);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /TeqFW application launcher/);
});

test('teq launcher fails with migration guidance for retired lifecycle metadata', async () => {
    const fixture = await createCliFixture();
    const manifestPath = path.join(fixture.root, 'package.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    manifest.teqfw.fw.cli.lifecycle = ['Fixture_App_Cli_Plugin$'];
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    try {
        const result = await run(fixture.launcher, ['fixture:finite'], fixture.root);
        assert.equal(result.code, 1);
        assert.ok(result.stderr.includes("retired 'teqfw.fw.cli.lifecycle'"));
        assert.ok(result.stderr.includes('plugin: "Example_Plugin_Lifecycle$"'));
        assert.ok(result.stderr.includes("'onStartup()' and 'onShutdown()'"));
        assert.ok(result.stderr.includes("'initialize', 'activate', 'deactivate', and 'dispose'"));
    } finally {
        await fixture.cleanup();
    }
});

test('teq PM2 container starts its configured script', async () => {
    const fixture = await createCliFixture();
    try {
        const bootstrap = `import(${JSON.stringify(pathToFileURL(fixture.binary).href)})`;
        const result = await run(process.execPath, ['--input-type=module', '--eval', bootstrap], fixture.root, {
            env: {...process.env, pm_exec_path: fixture.binary},
        });
        assert.equal(result.code, 0);
        assert.match(result.stdout, /"root"/);
    } finally {
        await fixture.cleanup();
    }
});
