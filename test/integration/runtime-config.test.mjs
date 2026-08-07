import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {launch} from '../../bin/teq.mjs';
import {clearCliFixtureGlobals, createCliFixture} from '../helper/fixture.mjs';

test('initializes immutable runtime config before plugin and command resolution', async () => {
    const fixture = await createCliFixture();
    const cwd = path.join(fixture.root, 'nested');
    await fs.mkdir(cwd);
    const dotenv = path.join(fixture.root, 'selected.env');
    await fs.writeFile(dotenv, 'TEQFW_FIXTURE__VALUE=selected\n');
    try {
        assert.equal(await launch({
            applicationRoot: fixture.root,
            argv: ['node', 'teq', 'fixture:finite', '--dotenv-file', 'selected.env'],
            cwd,
        }), 0);
        const expected = {
            root: fixture.root,
            cwd,
            argv: ['node', 'teq', 'fixture:finite'],
            dotenvPath: dotenv,
            dotenvExplicit: true,
        };
        assert.deepEqual(globalThis.__fixtureRuntimeConfig, expected);
        assert.deepEqual(globalThis.__fixtureCommandRuntimeConfig, {
            root: fixture.root,
            cwd,
            argv: ['node', 'teq', 'fixture:finite'],
        });
        assert.equal(globalThis.__fixturePluginConfig.VALUE, 'selected');
    } finally {
        clearCliFixtureGlobals();
        await fixture.cleanup();
    }
});
