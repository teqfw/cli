#!/usr/bin/env node
// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Container from '@teqfw/di/src/Container.mjs';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';
import PackageGraph from '../src/Infra/PackageGraph.mjs';
import ProviderRegistry from '../src/Registry/Provider.mjs';
import Io from '../src/Adapter/Io.mjs';
import Bootstrap from '../src/Bootstrap.mjs';

const appRoot = path.resolve(process.cwd());
const namespaceRegistry = new NamespaceRegistry({fs, path, appRoot});
const packageGraph = new PackageGraph({fs, path, appRoot});
const providerRegistry = new ProviderRegistry({packageGraph});
const container = new Container();
const io = new Io({processModule: {default: process}});
const bootstrap = new Bootstrap({namespaceRegistry, providerRegistry, container, io});

process.exitCode = await bootstrap.run({argv: process.argv, version: '0.1.0'});
