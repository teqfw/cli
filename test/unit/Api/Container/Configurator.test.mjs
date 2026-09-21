import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../../..', import.meta.url)));

test('accepts a two-argument configurator preprocessor', () => {
    /** @type {TeqFw_Cli_Api_Container_Configurator_Configuration} */
    const configuration = {
        preprocessors: [
            /**
             * @param {TeqFw_Di_Dto_DepId} depId
             * @param {TeqFw_Di_Container_ResolutionContext} context
             * @returns {TeqFw_Di_Dto_DepId}
             */
            function preprocessor(depId, context) {
                assert.equal(context.depId, depId);
                return depId;
            },
        ],
    };

    assert.equal(configuration.preprocessors?.[0]?.length, 2);
});

test('documents the conventional host bootstrap configurator in the published skill', async () => {
    const file = path.join(root, 'skills/teqfw-cli/references/usage.md');
    const documentation = await fs.readFile(file, 'utf8');

    assert.match(documentation, /recommended module path is `bootstrap\/di-config\.mjs`/);
    assert.match(documentation, /@implements \{TeqFw_Cli_Api_Container_Configurator\}/);
    assert.match(documentation, /configuration: \{sources: \[\]\}/);
    assert.match(documentation, /neither receives nor\nconstructs a Container/);
});
