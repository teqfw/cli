import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {discoverHeadApplication} from '../../launcher/HeadApplication.mjs';
import {collectMetadata} from '../../launcher/Metadata.mjs';
test('discovers the nearest head application from a nested directory', async () => { const root = await fs.mkdtemp(path.join(os.tmpdir(), 'teq-head-')); await fs.mkdir(path.join(root, 'nested/a'), {recursive: true}); await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({name: 'app', teqfw: {fw: {cli: {container: {configurator: './bootstrap/container.mjs'}}}}})); const found = await discoverHeadApplication(path.join(root, 'nested/a')); assert.equal(found.root, root); await assert.rejects(() => discoverHeadApplication(os.tmpdir()), /No TeqFW head application/); await fs.rm(root, {recursive: true, force: true}); });
test('reads exact package metadata keys', () => { const manifest = {teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './src'}]}, cli: {container: {configurator: './bootstrap/container.mjs'}, command: {default: 'app:run'}}}, pkg: {'@scope/name': {routes: true}, plain: {value: true}}}}; const metadata = collectMetadata([{name: 'app', rootAbs: '/app', packageJson: manifest}], '/app'); assert.equal(metadata.byPackage.app.pkg['@scope/name'].routes, true); assert.equal(metadata.cli.defaultCommand, 'app:run'); });
