import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

test('documents the conventional lifecycle plugin identity in the published skill', async () => {
    const file = path.join(root, 'skills/teqfw-cli/references/lifecycle.md');
    const documentation = await fs.readFile(file, 'utf8');

    assert.match(documentation, /Dependency Specifier: `\{NS\}_Plugin_Lifecycle\$`/);
    assert.match(documentation, /source path: `Plugin\/Lifecycle\.mjs`/);
    assert.match(documentation, /namespace: `\{NS\}_Plugin_Lifecycle`/);
    assert.match(documentation, /"plugin": "Example_App_Plugin_Lifecycle\$"/);
    assert.match(documentation, /does not mean the\ncomponent manages other plugins/);
});
