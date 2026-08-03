import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
async function json(file, value) { await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, JSON.stringify(value, null, 2)); }
async function source(root, name, value) { const file = path.join(root, name); await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file, value); }
async function link(root, name, target) { const file = path.join(root, 'node_modules', name); await fs.mkdir(path.dirname(file), {recursive: true}); await fs.symlink(target, file, 'dir'); }
export async function createCliFixture(options = {}) {
 const configurator = options.configurator ?? true;
 const plugin = options.plugin ?? true;
 const root = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-'));
 const cli = {command: {default: 'fixture:finite'}, commands: [
  {id: 'fixture:finite', path: ['fixture', 'finite'], summary: 'Finish', arguments: [], options: [], component: 'Fixture_App_Cli_Command_Finite$'},
  {id: 'fixture:wait', path: ['fixture', 'wait'], summary: 'Wait', arguments: [], options: [], component: 'Fixture_App_Cli_Command_Wait$'},
 ]};
 if (plugin) cli.plugin = 'Fixture_App_Cli_Plugin$';
 if (configurator) cli.container = {configurator: './src/Bootstrap/Container.mjs'};
 await json(path.join(root, 'package.json'), {name: 'fixture-app', version: '1.2.3', type: 'module', dependencies: {'@teqfw/cli': '0.1.0', '@teqfw/di': '2', '@teqfw/log': '0.1'}, teqfw: {fw: {di: {namespaces: [{prefix: 'Fixture_App_', path: './src'}]}, cli}}});
 if (configurator) await source(root, 'src/Bootstrap/Container.mjs', `/** @implements {TeqFw_Cli_Api_Container_Configurator} */\nexport default class Container { configure(params) { globalThis.__fixtureConfigurator = params.applicationRoot; return {namespaceRoots: [], preprocessors: [], postprocessors: [], logging: false}; } }\n`);
 if (plugin) await source(root, 'src/Cli/Plugin.mjs', `/** @implements {TeqFw_Cli_Api_Plugin} */\nexport default class Plugin { onStartup() { (globalThis.__fixtureCalls ??= []).push('plugin:start'); } onShutdown() { globalThis.__fixtureCalls.push('plugin:stop'); } }\n`);
 await source(root, 'src/Cli/Command/Finite.mjs', `export default class Finite { constructor({io}) { (globalThis.__fixtureCalls ??= []).push('command:finite:create'); return {id: 'fixture:finite', path: ['fixture', 'finite'], summary: 'Finish', lifetime: 'finite', arguments: [], options: [], execute: async ({launch}) => { globalThis.__fixtureCalls.push('command:finite:run'); globalThis.__fixtureLaunch = launch; io.write(JSON.stringify({cwd: launch.cwd, root: launch.applicationRoot}) + '\\n'); }}; } }\nexport const __deps__ = Object.freeze({default: Object.freeze({io: 'TeqFw_Cli_Adapter_Io$'})});\n`);
 await source(root, 'src/Cli/Command/Wait.mjs', `export default class Wait { constructor({io}) { (globalThis.__fixtureCalls ??= []).push('command:wait:create'); return {id: 'fixture:wait', path: ['fixture', 'wait'], summary: 'Wait', lifetime: 'long-running', arguments: [], options: [], start: async () => { let resolve; const done = new Promise((r) => { resolve = r; }); io.write('started\\n'); return {done, stop: async () => resolve()}; }}; } }\nexport const __deps__ = Object.freeze({default: Object.freeze({io: 'TeqFw_Cli_Adapter_Io$'})});\n`);
 await fs.mkdir(path.join(root, 'node_modules/@teqfw/cli/bin'), {recursive: true});
 await fs.copyFile(path.join(repoRoot, 'package.json'), path.join(root, 'node_modules/@teqfw/cli/package.json'));
 await fs.copyFile(path.join(repoRoot, 'bin/teq.mjs'), path.join(root, 'node_modules/@teqfw/cli/bin/teq.mjs'));
 await fs.chmod(path.join(root, 'node_modules/@teqfw/cli/bin/teq.mjs'), 0o755);
 await fs.mkdir(path.join(root, 'node_modules/.bin'), {recursive: true});
 await fs.symlink('../@teqfw/cli/bin/teq.mjs', path.join(root, 'node_modules/.bin/teq'));
 await fs.symlink(path.join(repoRoot, 'src'), path.join(root, 'node_modules/@teqfw/cli/src'), 'dir');
 await link(root, '@teqfw/di', path.join(repoRoot, 'node_modules/@teqfw/di')); await link(root, '@teqfw/log', path.join(repoRoot, 'node_modules/@teqfw/log'));
 return {root, binary: path.join(root, 'node_modules/@teqfw/cli/bin/teq.mjs'), launcher: path.join(root, 'node_modules/.bin/teq'), async cleanup() { await fs.rm(root, {recursive: true, force: true}); }};
}
