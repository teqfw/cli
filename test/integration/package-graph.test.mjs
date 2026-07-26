import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import PackageGraph from '../../src/Infra/PackageGraph.mjs';
import ProviderRegistry from '../../src/Registry/Provider.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('package traversal handles scoped, hoisted, transitive, and cyclic runtime dependencies', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const graph = new PackageGraph({fs, path, appRoot: fixture.root});
    const records = await graph.build();
    const names = records.map((record) => record.name);

    assert.deepEqual(names.slice(0, 5), [
        'fixture-root',
        '@scope/feature-b',
        '@teqfw/cli',
        '@teqfw/di',
        'feature-a',
    ]);
    assert.equal(names.filter((name) => name === 'feature-a').length, 1);
    assert.equal(names.includes('feature-transitive'), true);
    assert.equal(names.includes('commander'), true);
    assert.equal(names.includes('@teqfw/di'), true);

    const registry = new ProviderRegistry({packageGraph: graph});
    assert.deepEqual(await registry.build(), [
        'Fixture_Root_Provider$',
        'Fixture_B_Provider$',
        'Fixture_A_Provider$',
        'Fixture_Transitive_Provider$',
    ]);
});

test('package traversal rejects missing installed runtime dependencies', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const packageFile = path.join(fixture.root, 'package.json');
    const metadata = JSON.parse(await fs.readFile(packageFile, 'utf8'));
    metadata.dependencies.missing = '1.0.0';
    await fs.writeFile(packageFile, JSON.stringify(metadata));

    const graph = new PackageGraph({fs, path, appRoot: fixture.root});
    await assert.rejects(() => graph.build(), /Installed dependency is not found: 'missing'/);
});
