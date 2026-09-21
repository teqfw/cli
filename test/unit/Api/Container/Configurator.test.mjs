import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../../..', import.meta.url)));

test('accepts declarative DI policy producer identifiers', () => {
    /** @type {TeqFw_Cli_Api_Container_Configurator_Configuration} */
    const configuration = {
        container: {
            preprocessors: ['Fixture_App_Policy_Preprocessor$'],
            postprocessors: ['Fixture_App_Policy_Postprocessor$'],
        },
    };

    assert.deepEqual(configuration.container?.preprocessors, ['Fixture_App_Policy_Preprocessor$']);
    assert.deepEqual(configuration.container?.postprocessors, ['Fixture_App_Policy_Postprocessor$']);
});

test('documents the conventional host bootstrap configurator in the published skill', async () => {
    const file = path.join(root, 'skills/teqfw-cli/references/usage.md');
    const documentation = await fs.readFile(file, 'utf8');

    assert.match(documentation, /recommended module path is `bootstrap\/di-config\.mjs`/);
    assert.match(documentation, /@implements \{TeqFw_Cli_Api_Container_Configurator\}/);
    assert.match(documentation, /configuration: \{sources: \[\]\}/);
    assert.match(documentation, /neither receives nor\nconstructs a Container/);
});
