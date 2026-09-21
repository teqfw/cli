import assert from 'node:assert/strict';
import test from 'node:test';
import deepFreeze from '../../../src/Util/DeepFreeze.mjs';

test('deep freeze traverses symbol keys and cyclic graphs without freezing abort signals', () => {
    const marker = Symbol('marker');
    const value = {nested: {answer: 42}, [marker]: {value: true}};
    value.self = value;
    const controller = new AbortController();
    value.signal = controller.signal;

    const result = deepFreeze(value);

    assert.equal(result, value);
    assert.ok(Object.isFrozen(value));
    assert.ok(Object.isFrozen(value.nested));
    assert.ok(Object.isFrozen(value[marker]));
    assert.equal(Object.isFrozen(controller.signal), false);
});
