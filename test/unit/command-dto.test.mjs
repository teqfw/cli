import assert from 'node:assert/strict';
import test from 'node:test';
import {Factory as ArgumentFactory} from '../../src/Dto/Argument.mjs';
import {Factory as CommandFactory} from '../../src/Dto/Command.mjs';
import {Factory as DescriptorFactory} from '../../src/Dto/Command/Descriptor.mjs';
import {Factory as OptionFactory} from '../../src/Dto/Option.mjs';
import freeze from '../../src/Util/DeepFreeze.mjs';

function createFactories() {
    const argumentFactory = new ArgumentFactory({freeze});
    const optionFactory = new OptionFactory({freeze});
    return {
        command: new CommandFactory({argumentFactory, optionFactory, freeze}),
        descriptor: new DescriptorFactory({argumentFactory, optionFactory, freeze}),
    };
}

test('command factories default missing input arrays to frozen empty arrays', () => {
    const factories = createFactories();
    const descriptor = factories.descriptor.create({
        id: 'fixture:empty', summary: 'No input', component: 'Fixture_Command$',
    });
    const command = factories.command.create({
        id: 'fixture:empty', summary: 'No input', lifetime: 'finite', execute: async () => {},
    });

    assert.deepEqual(descriptor.arguments, []);
    assert.deepEqual(descriptor.options, []);
    assert.ok(Object.isFrozen(descriptor.arguments));
    assert.ok(Object.isFrozen(descriptor.options));
    assert.deepEqual(command.arguments, []);
    assert.deepEqual(command.options, []);
    assert.ok(Object.isFrozen(command.arguments));
    assert.ok(Object.isFrozen(command.options));
});

test('command factories reject supplied non-array input fields', () => {
    const factories = createFactories();
    assert.throws(() => factories.descriptor.create({
        id: 'fixture:invalid', summary: 'Invalid input', arguments: null, component: 'Fixture_Command$',
    }), /must be arrays when present/);
    assert.throws(() => factories.command.create({
        id: 'fixture:invalid', summary: 'Invalid input', lifetime: 'finite', options: {}, execute: async () => {},
    }), /must be arrays when present/);
});
