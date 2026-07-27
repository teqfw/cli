import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di/src/Container.mjs';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('host modules and logging resolve through DI after namespace configuration', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const container = new Container();
    const registry = new NamespaceRegistry({fs, path, appRoot: fixture.root});
    for (const entry of await registry.build()) container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
    for (const token of ['TeqFw_Cli_Adapter_Io__default', 'TeqFw_Cli_Adapter_Parser_Internal__default', 'TeqFw_Cli_Adapter_Signal__default', 'TeqFw_Cli_Bootstrap__default', 'TeqFw_Cli_Host__default', 'TeqFw_Cli_Registry_Lifecycle__default']) {
        assert.equal(typeof (await container.get(token)), 'function', token);
    }
    for (const token of ['TeqFw_Cli_Adapter_Parser_Internal$', 'TeqFw_Cli_Registry_Lifecycle$', 'TeqFw_Cli_Host$', 'TeqFw_Log_Provider$']) assert.equal(typeof (await container.get(token)), 'object', token);
});
