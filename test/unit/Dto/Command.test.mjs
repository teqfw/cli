import assert from 'node:assert/strict';
import test from 'node:test';
import {Factory as CommandFactory} from '../../../src/Dto/Command.mjs';

function createFactories() {
    const argumentFactory = {create: (/** @type {TeqFw_Cli_Manifest_Argument} */ data) => Object.freeze({...data})};
    const optionFactory = {create: (/** @type {TeqFw_Cli_Manifest_Option} */ data) => Object.freeze({...data})};
    const freeze = (/** @type {any} */ value) => Object.freeze(value);
    return {
        command: new CommandFactory(/** @type {any} */ ({argumentFactory, optionFactory, freeze})),
    };
}

test('command factories default missing input arrays to frozen empty arrays', () => {
    const factories = createFactories();
    const command = factories.command.create({
        id: 'fixture:empty', summary: 'No input', lifetime: 'finite', execute: async () => {},
    });

    assert.deepEqual(command.arguments, []);
    assert.deepEqual(command.options, []);
    assert.ok(Object.isFrozen(command.arguments));
    assert.ok(Object.isFrozen(command.options));
});

test('command factories reject supplied non-array input fields', () => {
    const factories = createFactories();
    assert.throws(() => factories.command.create({
        id: 'fixture:invalid', summary: 'Invalid input', lifetime: 'finite', options: {}, execute: async () => {},
    }), /must be arrays when present/);
});
