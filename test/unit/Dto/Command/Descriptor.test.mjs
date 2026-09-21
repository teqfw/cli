import assert from 'node:assert/strict';
import test from 'node:test';
import {Factory} from '../../../../src/Dto/Command/Descriptor.mjs';

const freeze = (value) => Object.freeze(value);

test('descriptor factory rejects ambiguous input names and non-terminal variadic arguments', () => {
    const factory = new Factory(/** @type {any} */ ({
        argumentFactory: {create: (data) => Object.freeze({...data})},
        optionFactory: {create: (data) => Object.freeze({...data})},
        freeze,
    }));

    assert.throws(() => factory.create({
        id: 'fixture:invalid', summary: 'Invalid input', component: 'Fixture_Command$',
        arguments: [
            {name: 'files', kind: 'string', variadic: true, description: ''},
            {name: 'target', kind: 'string', description: ''},
        ],
    }), /variadic argument must be the last/);
    assert.throws(() => factory.create({
        id: 'fixture:invalid', summary: 'Invalid input', component: 'Fixture_Command$',
        arguments: [{name: 'input', kind: 'string', description: ''}],
        options: [{name: 'input', kind: 'string', description: ''}],
    }), /Duplicate input name/);
});
