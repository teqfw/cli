import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import PackageRegistry from '@teqfw/di/node/registry/package';
import ProviderRegistry from '../../src/Registry/Provider.mjs';
import {createCliFixture} from '../helper/fixture.mjs';

test('DI package registry is dependency-first and exposes immutable static teqfw metadata', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const packageRegistry = new PackageRegistry({fs, path, appRoot: fixture.root});
    const records = await packageRegistry.build();
    const names = records.map((record) => record.name);

    assert.deepEqual(names, [
        '@scope/feature-b',
        '@teqfw/di',
        '@teqfw/log',
        '@teqfw/cli',
        'feature-transitive',
        'feature-a',
        'fixture-root',
    ]);
    for (const [index, record] of records.entries()) {
        for (const dependency of record.dependencies) {
            assert.ok(records.findIndex((item) => item.rootReal === dependency) < index, `${record.name} follows ${dependency}`);
        }
    }
    const root = records.at(-1);
    assert.deepEqual(root.packageJson.teqfw.instructions, {fixture: 'root'});
    assert.equal(Object.isFrozen(records), true);
    assert.equal(Object.isFrozen(root), true);
    assert.equal(Object.isFrozen(root.packageJson), true);
    assert.equal(Object.isFrozen(root.packageJson.teqfw.instructions), true);

    const registry = new ProviderRegistry({packageRegistry});
    assert.deepEqual(await registry.build(), [
        'Fixture_B_Provider$',
        'Fixture_Transitive_Provider$',
        'Fixture_A_Provider$',
        'Fixture_Root_Provider$',
    ]);
});

test('DI package registry rejects a missing installed runtime dependency', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const packageFile = path.join(fixture.root, 'package.json');
    const metadata = JSON.parse(await fs.readFile(packageFile, 'utf8'));
    metadata.dependencies.missing = '1.0.0';
    await fs.writeFile(packageFile, JSON.stringify(metadata));

    const packageRegistry = new PackageRegistry({fs, path, appRoot: fixture.root});
    await assert.rejects(() => packageRegistry.build(), /Installed dependency is not found: missing/);
});

test('DI package registry rejects cyclic runtime package dependencies', async (context) => {
    const fixture = await createCliFixture();
    context.after(() => fixture.cleanup());
    const packageFile = path.join(fixture.root, 'node_modules', 'feature-transitive', 'package.json');
    const metadata = JSON.parse(await fs.readFile(packageFile, 'utf8'));
    metadata.dependencies = {'feature-a': '1.0.0'};
    await fs.writeFile(packageFile, JSON.stringify(metadata));

    const packageRegistry = new PackageRegistry({fs, path, appRoot: fixture.root});
    await assert.rejects(
        () => packageRegistry.build(),
        /Cyclic package dependency detected/,
    );
});
