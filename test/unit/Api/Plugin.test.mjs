import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));

test('documents the conventional package-owned CLI plugin identity in the published skill', async () => {
    const file = path.join(root, 'skills/teqfw-cli/references/lifecycle.md');
    const documentation = await fs.readFile(file, 'utf8');

    assert.match(documentation, /Dependency Specifier: `\{PackageNamespace\}_Cli_Plugin\$`/);
    assert.match(documentation, /source path: `src\/Cli\/Plugin\.mjs`/);
    assert.match(documentation, /namespace: `\{PackageNamespace\}_Cli_Plugin`/);
    assert.match(documentation, /"plugin": "Example_App_Cli_Plugin\$"/);
    assert.match(documentation, /@implements \{TeqFw_Cli_Api_Plugin\}/);
    assert.match(documentation, /does not mean the\ncomponent manages other plugins/);
});
