import assert from 'node:assert/strict';
import {execFile, spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {promisify} from 'node:util';
import {createCliFixture} from '../helper/fixture.mjs';

const exec = promisify(execFile);

test('teq supports help, arbitrary cwd, default command, usage errors, and SIGINT shutdown', async () => {
    const fixture = await createCliFixture();
    try {
        const help = await exec(process.execPath, [fixture.binary, '--help'], {cwd: fixture.root});
        assert.match(help.stdout, /TeqFW application launcher/);
        const nested = path.join(fixture.root, 'nested');
        await fs.mkdir(nested);
        const nestedResult = await exec(process.execPath, [fixture.binary, 'fixture', 'finite'], {cwd: nested});
        assert.match(nestedResult.stdout, /"root"/);
        const defaultResult = await exec(process.execPath, [fixture.binary], {cwd: fixture.root});
        assert.match(defaultResult.stdout, /"cwd"/);
        await assert.rejects(() => exec(process.execPath, [fixture.binary, 'missing'], {cwd: fixture.root}), (error) => error.code === 2);
        const child = spawn(process.execPath, [fixture.binary, 'fixture', 'wait'], {cwd: fixture.root});
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
