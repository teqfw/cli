import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFile, spawn} from 'node:child_process';
import test, {after, before} from 'node:test';
import {promisify} from 'node:util';
import {createCliFixture} from '../helper/fixture.mjs';

const execFileAsync = promisify(execFile);
let fixture;

before(async () => {
    fixture = await createCliFixture();
});

after(async () => {
    await fixture.cleanup();
});

async function run(args) {
    try {
        const result = await execFileAsync(process.execPath, [fixture.binary, ...args], {
            cwd: fixture.root,
            env: {...process.env, TEQFW_CLI_CLEANUP_FILE: fixture.cleanupFile},
        });
        return {code: 0, stdout: result.stdout, stderr: result.stderr};
    } catch (error) {
        return {code: error.code, stdout: error.stdout, stderr: error.stderr};
    }
}

async function cleanupLog() {
    try {
        return await fs.readFile(fixture.cleanupFile, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') return '';
        throw error;
    }
}

test('binary prints help and version with success status', async () => {
    const help = await run(['--help']);
    assert.equal(help.code, 0);
    assert.match(help.stdout, /TeqFW command-line host/);
    assert.match(help.stdout, /fixture/);
    assert.equal(help.stderr, '');

    const version = await run(['--version']);
    assert.equal(version.code, 0);
    assert.equal(version.stdout, '0.1.0\n');
    assert.equal(version.stderr, '');
});

test('binary executes a typed fixture command and cleans it once', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const result = await run([
        'fixture', 'echo', '3', 'true',
        '--label', 'acceptance',
        '--tag', '1',
        '--tag', '2',
        '--verbose',
    ]);
    assert.equal(result.code, 0);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {
        args: {count: 3, enabled: true},
        options: {label: 'acceptance', tag: [1, 2], verbose: true},
        aborted: false,
    });
    assert.equal(await cleanupLog(), 'echo\n');
});

test('unknown command and missing required option are usage errors without cleanup', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const unknown = await run(['unknown']);
    assert.equal(unknown.code, 2);
    assert.match(unknown.stderr, /unknown command/);

    const missing = await run(['fixture', 'echo', '3', 'true']);
    assert.equal(missing.code, 2);
    assert.match(missing.stderr, /required option/);
    assert.equal(await cleanupLog(), '');
});

test('operational exception returns 1 and cleanup still runs', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const result = await run(['fixture', 'fail']);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /fixture operational failure/);
    assert.equal(await cleanupLog(), 'fail\n');
});

test('SIGINT aborts execution, cleans up, and exits 130', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const child = spawn(process.execPath, [fixture.binary, 'fixture', 'wait'], {
        cwd: fixture.root,
        env: {...process.env, TEQFW_CLI_CLEANUP_FILE: fixture.cleanupFile},
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
        stdout += chunk;
        if (stdout.includes('waiting\n')) child.kill('SIGINT');
    });
    child.stderr.on('data', (chunk) => {
        stderr += chunk;
    });
    const result = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code, signal) => resolve({code, signal}));
    });

    assert.deepEqual(result, {code: 130, signal: null});
    assert.equal(stdout, 'waiting\n');
    assert.equal(stderr, '');
    assert.equal(await cleanupLog(), 'wait\n');
});
