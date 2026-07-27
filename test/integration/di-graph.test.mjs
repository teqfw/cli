import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Container from '@teqfw/di/src/Container.mjs';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';
import PackageGraph from '../../src/Infra/PackageGraph.mjs';
import ProviderRegistry from '../../src/Registry/Provider.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('real DI resolves command and lifecycle providers after every namespace is configured', async (context) => {
    const fixture = await createCliFixture(); context.after(() => fixture.cleanup());
    const container = new Container();
    const namespaces = await new NamespaceRegistry({fs, path, appRoot: fixture.root}).build();
    for (const entry of namespaces) container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
    const providers = new ProviderRegistry({packageGraph: new PackageGraph({fs, path, appRoot: fixture.root})});
    const tokens = await providers.build('cli');
    const resolved = await Promise.all(tokens.map((token) => container.get(token)));
    const commands = (await container.get('TeqFw_Cli_Registry_Command$')).build(resolved);
    assert.equal(commands[0].id, 'fixture:echo');
    assert.deepEqual(await providers.build('lifecycle'), []);
    assert.equal(typeof (await container.get('TeqFw_Cli_Host$')).run, 'function');
});
