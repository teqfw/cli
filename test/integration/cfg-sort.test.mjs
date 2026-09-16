import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {launch} from '../../bin/teq.mjs';
import {clearCliFixtureGlobals, createCliFixture} from '../helper/fixture.mjs';

async function withFile(callback) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-cfg-sort-'));
    const file = path.join(root, 'settings.env');
    try {
        await callback({root, file});
    } finally {
        await fs.rm(root, {recursive: true, force: true});
    }
}

test('cfg:sort rewrites an explicit dotenv file and supports check and dry-run', async () => {
    const fixture = await createCliFixture();
    try {
        await withFile(async ({root, file}) => {
            const source = 'TEQFW_WEB__PORT=3000\nAPP_CORE__ZETA=z\nAPP_CORE__ALPHA=a\n';
            const ordered = 'APP_CORE__ALPHA=a\nAPP_CORE__ZETA=z\n\nTEQFW_WEB__PORT=3000\n';
            await fs.writeFile(file, source);

            assert.equal(await launch({applicationRoot: fixture.root, cwd: root, argv: ['node', 'teq', 'cfg:sort', file, '--dry-run']}), 0);
            assert.equal(await fs.readFile(file, 'utf8'), source);
            assert.equal(await launch({applicationRoot: fixture.root, cwd: root, argv: ['node', 'teq', 'cfg:sort', file, '--check']}), 1);
            assert.equal(await fs.readFile(file, 'utf8'), source);
            assert.equal(await launch({applicationRoot: fixture.root, cwd: root, argv: ['node', 'teq', 'cfg:sort', file]}), 0);
            assert.equal(await fs.readFile(file, 'utf8'), ordered);
            assert.equal(await launch({applicationRoot: fixture.root, cwd: root, argv: ['node', 'teq', 'cfg:sort', file, '--check']}), 0);
        });
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});

test('cfg:sort defaults to the host application .env', async () => {
    const fixture = await createCliFixture();
    const file = path.join(fixture.root, '.env');
    try {
        await fs.writeFile(file, 'TEQFW_WEB__PORT=3000\nAPP_CORE__VALUE=value\n');
        assert.equal(await launch({applicationRoot: fixture.root, cwd: fixture.root, argv: ['node', 'teq', 'cfg:sort']}), 0);
        assert.equal(await fs.readFile(file, 'utf8'), 'APP_CORE__VALUE=value\n\nTEQFW_WEB__PORT=3000\n');
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});
