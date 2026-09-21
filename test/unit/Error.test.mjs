import assert from 'node:assert/strict';
import test from 'node:test';
import createError from '../../src/Error.mjs';

test('error factory preserves category, reporting state, and cause', () => {
    const cause = new Error('source failure');
    const error = createError('configuration', 'Configuration failed.', {cause, reported: true});

    assert.equal(error.name, 'TeqFwCliError');
    assert.equal(error.message, 'Configuration failed.');
    assert.equal(error.category, 'configuration');
    assert.equal(error.reported, true);
    assert.equal(error.cause, cause);
    assert.equal(createError('usage', 'Bad input').reported, false);
});
