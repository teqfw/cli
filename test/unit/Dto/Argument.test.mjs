import assert from 'node:assert/strict';
import test from 'node:test';
import {Factory} from '../../../src/Dto/Argument.mjs';

const freeze = (value) => Object.freeze(value);

test('argument factory validates defaults and returns frozen parser-neutral data', () => {
    const factory = new Factory({freeze});
    const argument = factory.create({name: 'count', kind: 'number', required: false, variadic: false, description: 'Count', defaultValue: 2});

    assert.deepEqual({...argument}, {name: 'count', kind: 'number', required: false, variadic: false, description: 'Count', defaultValue: 2});
    assert.ok(Object.isFrozen(argument));
    assert.throws(() => factory.create({name: 'bad_name', kind: 'string', description: ''}), /name is invalid/);
    assert.throws(() => factory.create({name: 'count', kind: 'number', required: true, description: '', defaultValue: 1}), /required argument/);
    assert.throws(() => factory.create({name: 'count', kind: 'number', description: '', defaultValue: Infinity}), /finite number/);
});
