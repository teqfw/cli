#!/usr/bin/env node
// @ts-check

import process from 'node:process';
import Io from '../src/Adapter/Io.mjs';
import {launch} from '../launcher/Launch.mjs';

const io = new Io({processModule: {default: process}});
try {
    process.exitCode = await launch({argv: [...process.argv], cwd: process.cwd(), version: '0.1.0', io});
} catch (error) {
    io.error(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
}
