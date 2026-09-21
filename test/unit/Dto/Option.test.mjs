import assert from 'node:assert/strict';
import test from 'node:test';
import {Factory} from '../../../src/Dto/Option.mjs';

function freeze(value) {
    if (value && typeof value === 'object') {
        for (const item of Reflect.ownKeys(value)) freeze(value[item]);
        Object.freeze(value);
    }
    return value;
}

test('option factory copies repeatable defaults and rejects incompatible definitions', () => {
    const factory = new Factory({freeze});
    const defaultValue = ['one'];
    const option = factory.create({name: 'tag', short: 't', kind: 'string', repeatable: true, description: 'Tag', defaultValue});
    defaultValue.push('two');

    assert.deepEqual(option.defaultValue, ['one']);
    assert.ok(Object.isFrozen(option));
    assert.ok(Object.isFrozen(option.defaultValue));
    assert.throws(() => factory.create({name: 'tag', short: 'too', kind: 'string', description: ''}), /short alias is invalid/);
    assert.throws(() => factory.create({name: 'tag', kind: 'boolean', repeatable: true, description: '', defaultValue: true}), /must be an array/);
    assert.throws(() => factory.create({name: 'tag', kind: 'boolean', required: true, description: '', defaultValue: true}), /required option/);
});
