import assert from 'node:assert/strict';
import test from 'node:test';
import {Command as CommanderCommand, Option as CommanderOption} from 'commander';
import Commander from '../../src/Adapter/Parser/Commander.mjs';
import createError from '../../src/Error.mjs';
import deepFreeze from '../../src/Util/DeepFreeze.mjs';
import {Factory as ArgumentFactory} from '../../src/Dto/Argument.mjs';
import {Factory as OptionFactory} from '../../src/Dto/Option.mjs';
import {Factory as CommandFactory} from '../../src/Dto/Command.mjs';

const parser = new Commander({
    CommandClass: CommanderCommand,
    OptionClass: CommanderOption,
    createError,
});
const argumentFactory = new ArgumentFactory({freeze: deepFreeze});
const optionFactory = new OptionFactory({freeze: deepFreeze});
const commandFactory = new CommandFactory({argumentFactory, optionFactory, freeze: deepFreeze});

const makeIo = () => {
    const out = [];
    const err = [];
    return {
        io: {write: (value) => out.push(value), error: (value) => err.push(value)},
        out,
        err,
    };
};

test('Commander adapter emits typed parser-neutral args and options', async () => {
    const command = commandFactory.create({
        id: 'demo:run',
        path: ['demo', 'run'],
        summary: 'Run demo',
        arguments: [
            {name: 'count', kind: 'number', required: true, description: 'Count'},
            {name: 'enabled', kind: 'boolean', required: true, description: 'Enabled'},
        ],
        options: [
            {name: 'label', short: 'l', kind: 'string', required: true, description: 'Label'},
            {name: 'tag', kind: 'number', repeatable: true, description: 'Tags', defaultValue: []},
            {name: 'verbose', short: 'v', kind: 'boolean', description: 'Verbose'},
        ],
        execute: async () => {},
    });
    const output = makeIo();
    let received;
    await parser.parse({
        commands: [command],
        argv: ['node', 'teq', 'demo', 'run', '3', 'true', '--label', 'x', '--tag', '1', '--tag', '2', '--verbose'],
        version: '0.1.0',
        io: output.io,
        async onExecute(descriptor, args, options) {
            received = {descriptor, args, options};
        },
    });

    assert.equal(received.descriptor.id, 'demo:run');
    assert.deepEqual(received.args, {count: 3, enabled: true});
    assert.deepEqual(received.options, {label: 'x', tag: [1, 2], verbose: true});
});

test('Commander adapter classifies missing required options as reported usage errors', async () => {
    const command = commandFactory.create({
        id: 'demo:run',
        path: ['demo', 'run'],
        summary: 'Run demo',
        arguments: [],
        options: [{name: 'label', kind: 'string', required: true, description: 'Label'}],
        execute: async () => {},
    });
    const output = makeIo();
    await assert.rejects(
        () => parser.parse({
            commands: [command],
            argv: ['node', 'teq', 'demo', 'run'],
            version: '0.1.0',
            io: output.io,
            async onExecute() {},
        }),
        (error) => (error.category === 'usage') && (error.reported === true),
    );
    assert.match(output.err.join(''), /required option/);
});

test('Commander adapter handles help and version without action execution', async () => {
    const output = makeIo();
    let executions = 0;
    const common = {
        commands: [],
        version: '0.1.0',
        io: output.io,
        async onExecute() { executions += 1; },
    };
    assert.equal(await parser.parse({...common, argv: ['node', 'teq', '--help']}), 'help');
    assert.equal(await parser.parse({...common, argv: ['node', 'teq', '--version']}), 'version');
    assert.equal(executions, 0);
    assert.match(output.out.join(''), /0\.1\.0/);
});
