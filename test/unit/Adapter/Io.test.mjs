import assert from 'node:assert/strict';
import test from 'node:test';
import Io from '../../../src/Adapter/Io.mjs';

test('I/O adapter writes normalized output to the matching process stream', () => {
    const output = [];
    const errors = [];
    const io = new Io({processModule: {default: {
        stdout: {write: (value) => output.push(value)},
        stderr: {write: (value) => errors.push(value)},
    }}});

    io.write(/** @type {any} */ (42));
    io.error(/** @type {any} */ (null));

    assert.deepEqual(output, ['42']);
    assert.deepEqual(errors, ['null']);
});
