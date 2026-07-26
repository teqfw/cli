import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di/src/Container.mjs';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('all CLI module exports smoke-resolve through DI 2.x', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const container = new Container();
    const registry = new NamespaceRegistry({fs, path, appRoot: fixture.root});
    for (const entry of await registry.build()) {
        container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
    }

    const asIsTokens = [
        'TeqFw_Cli_Adapter_Io__default',
        'TeqFw_Cli_Adapter_Parser_Commander__default',
        'TeqFw_Cli_Adapter_Signal__default',
        'TeqFw_Cli_Bootstrap__default',
        'TeqFw_Cli_Dto_Argument__default',
        'TeqFw_Cli_Dto_Argument__Factory',
        'TeqFw_Cli_Dto_Command__default',
        'TeqFw_Cli_Dto_Command__Factory',
        'TeqFw_Cli_Dto_Option__default',
        'TeqFw_Cli_Dto_Option__Factory',
        'TeqFw_Cli_Error__default',
        'TeqFw_Cli_Infra_PackageGraph__default',
        'TeqFw_Cli_Registry_Command__default',
        'TeqFw_Cli_Registry_Provider__default',
        'TeqFw_Cli_Runner__default',
        'TeqFw_Cli_Util_DeepFreeze__default',
    ];
    for (const token of asIsTokens) {
        assert.equal(typeof (await container.get(token)), 'function', token);
    }

    const instanceTokens = [
        'TeqFw_Cli_Adapter_Io$',
        'TeqFw_Cli_Adapter_Parser_Commander$$',
        'TeqFw_Cli_Adapter_Signal$',
        'TeqFw_Cli_Dto_Argument__Factory$',
        'TeqFw_Cli_Dto_Command__Factory$',
        'TeqFw_Cli_Dto_Option__Factory$',
        'TeqFw_Cli_Registry_Command$',
        'TeqFw_Cli_Runner$$',
    ];
    for (const token of instanceTokens) {
        assert.equal(typeof (await container.get(token)), 'object', token);
    }
});
