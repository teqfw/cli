#!/usr/bin/env node
// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/node/registry/namespace';
import PackageRegistry from '@teqfw/di/node/registry/package';
import ProviderRegistry from '../src/Registry/Provider.mjs';
import Io from '../src/Adapter/Io.mjs';
import Bootstrap from '../src/Bootstrap.mjs';

const appRoot = path.resolve(process.cwd());
const bootstrap = new Bootstrap({
    namespaceRegistry: new NamespaceRegistry({fs, path, appRoot}),
    providerRegistry: new ProviderRegistry({packageRegistry: new PackageRegistry({fs, path, appRoot})}),
    container: new Container(),
    io: new Io({processModule: {default: process}}),
});

process.exitCode = await bootstrap.run({argv: process.argv, version: '0.1.0'});
