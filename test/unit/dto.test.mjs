import assert from 'node:assert/strict';
import test from 'node:test';
import deepFreeze from '../../src/Util/DeepFreeze.mjs';
import {Factory as ArgumentFactory} from '../../src/Dto/Argument.mjs';
import {Factory as OptionFactory} from '../../src/Dto/Option.mjs';
import {Factory as CommandFactory} from '../../src/Dto/Command.mjs';

const argumentFactory = new ArgumentFactory({freeze: deepFreeze});
const optionFactory = new OptionFactory({freeze: deepFreeze});
const commandFactory = new CommandFactory({argumentFactory, optionFactory, freeze: deepFreeze});

test('argument factory normalizes defaults, validates types, and freezes output', () => {
    const source = {name: 'count', kind: 'number', description: 'Item count', defaultValue: 2};
    const result = argumentFactory.create(source);

    assert.deepEqual({...result}, {
        name: 'count',
        kind: 'number',
        required: false,
        variadic: false,
        description: 'Item count',
        defaultValue: 2,
    });
    assert.equal(Object.isFrozen(result), true);
    source.name = 'changed';
    assert.equal(result.name, 'count');
    assert.throws(
        () => argumentFactory.create({name: 'count', kind: 'number', required: true, description: '', defaultValue: 1}),
        /required argument/,
    );
    assert.throws(
        () => argumentFactory.create({name: 'count', kind: 'number', description: '', defaultValue: '1'}),
        /finite number|must be a number/,
    );
});

test('option factory copies repeatable defaults and validates aliases', () => {
    const defaults = ['a'];
    const result = optionFactory.create({
        name: 'tag',
        short: 't',
        kind: 'string',
        repeatable: true,
        description: 'Tags',
        defaultValue: defaults,
    });

    defaults.push('b');
    assert.deepEqual(result.defaultValue, ['a']);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.defaultValue), true);
    assert.throws(
        () => optionFactory.create({name: 'tag', short: 'too-long', kind: 'string', description: ''}),
        /short alias/,
    );
    assert.throws(
        () => optionFactory.create({name: 'tag', kind: 'string', repeatable: true, description: '', defaultValue: 'a'}),
        /must be an array/,
    );
});

test('command factory defensively copies and deeply freezes a complete descriptor', () => {
    const path = ['db', 'export'];
    const args = [{name: 'target', kind: 'string', required: true, description: 'Target'}];
    const options = [{name: 'limit', kind: 'number', description: 'Limit', defaultValue: 10}];
    const execute = async () => 'done';
    const cleanup = () => {};
    const result = commandFactory.create({
        id: 'db:export',
        path,
        summary: ' Export data ',
        arguments: args,
        options,
        execute,
        cleanup,
    });

    path.push('changed');
    args[0].name = 'changed';
    options[0].defaultValue = 99;
    assert.deepEqual(result.path, ['db', 'export']);
    assert.equal(result.arguments[0].name, 'target');
    assert.equal(result.options[0].defaultValue, 10);
    assert.equal(result.summary, 'Export data');
    assert.equal(result.execute, execute);
    assert.equal(result.cleanup, cleanup);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.path), true);
    assert.equal(Object.isFrozen(result.arguments), true);
    assert.equal(Object.isFrozen(result.arguments[0]), true);
});

test('command factory rejects invalid layout and callable contracts', () => {
    const base = {
        id: 'demo:run',
        path: ['demo', 'run'],
        summary: 'Run',
        arguments: [],
        options: [],
        execute: async () => {},
    };
    assert.throws(() => commandFactory.create({...base, execute() {}}), /async function/);
    assert.throws(
        () => commandFactory.create({
            ...base,
            arguments: [
                {name: 'many', kind: 'string', variadic: true, description: ''},
                {name: 'after', kind: 'string', description: ''},
            ],
        }),
        /last argument/,
    );
    assert.throws(
        () => commandFactory.create({
            ...base,
            arguments: [{name: 'same', kind: 'string', description: ''}],
            options: [{name: 'same', kind: 'string', description: ''}],
        }),
        /Duplicate input name/,
    );
});
