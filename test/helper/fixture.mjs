import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
async function json(file, value) { await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, JSON.stringify(value, null, 2)); }
async function source(root, name, value) { const file = path.join(root, name); await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, value); }
async function link(root, name, target) { const file = path.join(root, 'node_modules', name); await fs.mkdir(path.dirname(file), {recursive: true}); await fs.symlink(target, file, 'dir'); }
export async function createCliFixture() {
 const root = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-'));
 await json(path.join(root, 'package.json'), {name: 'fixture-app', version: '1.2.3', type: 'module', dependencies: {'@teqfw/cli': '0.1.0', '@teqfw/di': '2', '@teqfw/log': '0.1'}, teqfw: {fw: {di: {namespaces: [{prefix: 'Fixture_App_', path: './src'}]}, cli: {container: {configurator: './bootstrap/container.mjs'}, command: {default: 'fixture:finite'}, commands: ['Fixture_App_Provider$']}}}});
 await source(root, 'bootstrap/container.mjs', `export default function configure(input) { globalThis.__fixtureConfigurator = Object.isFrozen(input) && input.cwd; return {preprocessors: [], postprocessors: []}; }\n`);
 await source(root, 'src/Provider.mjs', `// @ts-check\n/** @namespace Fixture_App_Provider @description Fixture command publisher. */\nexport default class Provider { constructor({commands}) { this.getCommands = () => commands.get(); } }\nexport const __deps__ = Object.freeze({default: Object.freeze({commands: 'Fixture_App_Commands$'})});\n`);
 await source(root, 'src/Commands.mjs', `// @ts-check\n/** @namespace Fixture_App_Commands @description Fixture commands. */\nexport default class Commands { constructor({factory, io}) { const finite = factory.create({id: 'fixture:finite', path: ['fixture', 'finite'], summary: 'Finish', lifetime: 'finite', arguments: [], options: [], execute: async ({launch}) => io.write(JSON.stringify({cwd: launch.cwd, root: launch.applicationRoot}) + '\\n')}); const wait = factory.create({id: 'fixture:wait', path: ['fixture', 'wait'], summary: 'Wait', lifetime: 'long-running', arguments: [], options: [], start: async () => { let resolve; const done = new Promise((r) => { resolve = r; }); io.write('started\\n'); return {done, stop: async () => resolve()}; }}); this.get = () => Object.freeze([finite, wait]); } }\nexport const __deps__ = Object.freeze({default: Object.freeze({factory: 'TeqFw_Cli_Dto_Command__Factory$', io: 'TeqFw_Cli_Adapter_Io$'})});\n`);
 await link(root, '@teqfw/cli', repoRoot); await link(root, '@teqfw/di', path.join(repoRoot, 'node_modules/@teqfw/di')); await link(root, '@teqfw/log', path.join(repoRoot, 'node_modules/@teqfw/log'));
 return {root, binary: path.join(repoRoot, 'bin/teq.mjs'), async cleanup() { await fs.rm(root, {recursive: true, force: true}); }};
}
