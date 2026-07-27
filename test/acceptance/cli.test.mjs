import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFile, spawn} from 'node:child_process';
import test, {after, before} from 'node:test';
import {promisify} from 'node:util';
import {createCliFixture} from '../helper/fixture.mjs';

const execFileAsync = promisify(execFile);
let fixture;
before(async () => { fixture = await createCliFixture(); });
after(async () => { await fixture.cleanup(); });

async function run(args) {
    try {
        const result = await execFileAsync(process.execPath, [fixture.binary, ...args], {cwd: fixture.root, env: {...process.env, TEQFW_CLI_CLEANUP_FILE: fixture.cleanupFile}});
        return {code: 0, stdout: result.stdout, stderr: result.stderr};
    } catch (error) {
        return {code: error.code, stdout: error.stdout, stderr: error.stderr};
    }
}
async function cleanupLog() { try { return await fs.readFile(fixture.cleanupFile, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return ''; throw error; } }

test('binary prints host help and version', async () => {
    const help = await run(['--help']);
    assert.equal(help.code, 0); assert.match(help.stdout, /TeqFW application host/); assert.match(help.stdout, /fixture/);
    const version = await run(['--version']);
    assert.equal(version.code, 0); assert.match(version.stdout, /0.1.0/);
});

test('binary executes typed command and emits observable lifecycle logs', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const result = await run(['fixture', 'echo', '3', 'true', '--label', 'acceptance', '--tag', '1', '--tag', '2', '--verbose']);
    assert.equal(result.code, 0);
    const output = JSON.parse(result.stdout.split('\n').find((line) => line.startsWith('{')));
    assert.deepEqual(output, {args: {count: 3, enabled: true}, options: {label: 'acceptance', tag: [1, 2], verbose: true}, aborted: false});
    assert.match(result.stdout, /Initialization phase started/); assert.match(result.stdout, /Final process outcome/);
    assert.equal(await cleanupLog(), 'echo\n');
});

test('invalid input is a usage error without command cleanup', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const unknown = await run(['unknown']); assert.equal(unknown.code, 2); assert.match(unknown.stderr, /unknown command/);
    const missing = await run(['fixture', 'echo', '3', 'true']); assert.equal(missing.code, 2); assert.match(missing.stderr, /required option/);
    assert.equal(await cleanupLog(), '');
});

test('command failure preserves error and command-local cleanup', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const result = await run(['fixture', 'fail']);
    assert.equal(result.code, 1); assert.match(result.stderr, /fixture operational failure/); assert.equal(await cleanupLog(), 'fail\n');
});

test('SIGINT aborts the long-running command and returns 130', async () => {
    await fs.rm(fixture.cleanupFile, {force: true});
    const child = spawn(process.execPath, [fixture.binary, 'fixture', 'wait'], {cwd: fixture.root, env: {...process.env, TEQFW_CLI_CLEANUP_FILE: fixture.cleanupFile}, stdio: ['ignore', 'pipe', 'pipe']});
    let stdout = ''; let sent = false;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; if (!sent && stdout.includes('waiting\n')) { sent = true; child.kill('SIGINT'); } });
    const result = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (code, signal) => resolve({code, signal})); });
    assert.deepEqual(result, {code: 130, signal: null}); assert.match(stdout, /waiting\n/); assert.equal(await cleanupLog(), 'wait\n');
});
