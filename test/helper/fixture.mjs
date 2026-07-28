import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

async function writeJson(file, data) {
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function writeSource(root, relative, source) {
    const file = path.join(root, relative);
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, source);
}

async function linkDependency(root, name, target) {
    const destination = path.join(root, 'node_modules', name);
    await fs.mkdir(path.dirname(destination), {recursive: true});
    await fs.symlink(target, destination, 'dir');
}

function providerSource(namespace, commandToken) {
    return `// @ts-check

/**
 * @namespace ${namespace}_Provider
 * @description Integration fixture CLI provider.
 */

export default class Provider {
    constructor({command}) {
        const commands = Object.freeze([command.get()]);
        this.getCommands = function () {
            return commands;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        command: '${commandToken}',
    }),
});
`;
}

function simpleCommandSource(namespace, id, commandPath) {
    return `// @ts-check

/**
 * @namespace ${namespace}_Command
 * @description Integration fixture command component.
 */

export default class Command {
    constructor({factory}) {
        const descriptor = factory.create({
            id: '${id}',
            path: ${JSON.stringify(commandPath)},
            summary: '${id}',
            arguments: [],
            options: [],
            execute: async function () {},
        });
        this.get = function () {
            return descriptor;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        factory: 'TeqFw_Cli_Dto_Command__Factory$',
    }),
});
`;
}

async function createFeature(root, {name, namespace, id, commandPath, dependencies = {}}) {
    await writeJson(path.join(root, 'package.json'), {
        name,
        version: '1.0.0',
        type: 'module',
        dependencies,
        teqfw: {
            namespaces: [{prefix: `${namespace}_`, path: './src', ext: '.mjs'}],
            providers: {cli: [`${namespace}_Provider$`]},
        },
    });
    await writeSource(root, 'src/Provider.mjs', providerSource(namespace, `${namespace}_Command$`));
    await writeSource(root, 'src/Command.mjs', simpleCommandSource(namespace, id, commandPath));
}

const rootProviderSource = `// @ts-check

/**
 * @namespace Fixture_Root_Provider
 * @description Root application CLI provider fixture.
 */

export default class Provider {
    constructor({commands}) {
        this.getCommands = function () {
            return commands.get();
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        commands: 'Fixture_Root_Commands$',
    }),
});
`;

const rootCommandsSource = `// @ts-check

/**
 * @namespace Fixture_Root_Commands
 * @description Root application typed command fixtures.
 */

export default class Commands {
    constructor({factory, io, fsModule, processModule}) {
        const fs = fsModule.default;
        const process = processModule.default;
        const mark = function (name) {
            const file = process.env.TEQFW_CLI_CLEANUP_FILE;
            if (file) fs.appendFileSync(file, \`\${name}\\n\`);
        };
        const echo = factory.create({
            id: 'fixture:echo',
            path: ['fixture', 'echo'],
            summary: 'Echo typed input',
            arguments: [
                {name: 'count', kind: 'number', required: true, variadic: false, description: 'Count'},
                {name: 'enabled', kind: 'boolean', required: true, variadic: false, description: 'Enabled'},
            ],
            options: [
                {name: 'label', short: 'l', kind: 'string', required: true, repeatable: false, description: 'Label'},
                {name: 'tag', short: 't', kind: 'number', required: false, repeatable: true, description: 'Tags', defaultValue: []},
                {name: 'verbose', short: 'v', kind: 'boolean', required: false, repeatable: false, description: 'Verbose'},
            ],
            execute: async function ({args, options, signal}) {
                io.write(JSON.stringify({args, options, aborted: signal.aborted}) + '\\n');
            },
            cleanup: async function () {
                mark('echo');
            },
        });
        const fail = factory.create({
            id: 'fixture:fail',
            path: ['fixture', 'fail'],
            summary: 'Throw an operational error',
            arguments: [],
            options: [],
            execute: async function () {
                throw new Error('fixture operational failure');
            },
            cleanup: async function () {
                mark('fail');
            },
        });
        const wait = factory.create({
            id: 'fixture:wait',
            path: ['fixture', 'wait'],
            summary: 'Wait for an abort signal',
            arguments: [],
            options: [],
            execute: async function ({signal}) {
                io.write('waiting\\n');
                await new Promise((resolve, reject) => {
                    if (signal.aborted) {
                        reject(signal.reason);
                        return;
                    }
                    signal.addEventListener('abort', () => reject(signal.reason), {once: true});
                });
            },
            cleanup: async function () {
                mark('wait');
            },
        });
        const result = Object.freeze([echo, fail, wait]);
        this.get = function () {
            return result;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        factory: 'TeqFw_Cli_Dto_Command__Factory$',
        io: 'TeqFw_Cli_Adapter_Io$',
        fsModule: 'node:fs',
        processModule: 'node:process',
    }),
});
`;

export async function createCliFixture() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-cli-fixture-'));
    const cleanupFile = path.join(root, 'cleanup.log');
    const dependencies = {
        '@scope/feature-b': '1.0.0',
        '@teqfw/cli': '0.1.0',
        '@teqfw/di': 'git+https://github.com/teqfw/di.git#67a54a0889749ff2f052ae2baf67790125c6ba65',
        'feature-a': '1.0.0',
    };
    await writeJson(path.join(root, 'package.json'), {
        name: 'fixture-root',
        version: '1.0.0',
        type: 'module',
        dependencies,
        teqfw: {
            namespaces: [{prefix: 'Fixture_Root_', path: './src', ext: '.mjs'}],
            providers: {cli: ['Fixture_Root_Provider$']},
            instructions: {fixture: 'root'},
        },
    });
    await writeSource(root, 'src/Provider.mjs', rootProviderSource);
    await writeSource(root, 'src/Commands.mjs', rootCommandsSource);

    await linkDependency(root, '@teqfw/cli', repoRoot);
    await linkDependency(root, '@teqfw/di', path.join(repoRoot, 'node_modules', '@teqfw', 'di'));
    await linkDependency(root, '@teqfw/log', path.join(repoRoot, 'node_modules', '@teqfw', 'log'));

    await createFeature(path.join(root, 'node_modules', 'feature-a'), {
        name: 'feature-a',
        namespace: 'Fixture_A',
        id: 'alpha:ping',
        commandPath: ['alpha', 'ping'],
        dependencies: {'feature-transitive': '1.0.0'},
    });
    await createFeature(path.join(root, 'node_modules', '@scope', 'feature-b'), {
        name: '@scope/feature-b',
        namespace: 'Fixture_B',
        id: 'beta:ping',
        commandPath: ['beta', 'ping'],
    });
    await createFeature(path.join(root, 'node_modules', 'feature-transitive'), {
        name: 'feature-transitive',
        namespace: 'Fixture_Transitive',
        id: 'transitive:ping',
        commandPath: ['transitive', 'ping'],
    });

    return {
        root,
        cleanupFile,
        binary: path.join(repoRoot, 'bin', 'teq.mjs'),
        async cleanup() {
            await fs.rm(root, {recursive: true, force: true});
        },
    };
}
