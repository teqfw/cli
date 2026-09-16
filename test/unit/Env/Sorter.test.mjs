import assert from 'node:assert/strict';
import test from 'node:test';
import Sorter from '../../../src/Env/Sorter.mjs';

test('sorter orders namespaces and parameters while retaining attached comments and dotenv forms', () => {
    const source = [
        'UNRELATED=one',
        'export ZED=two # retain this',
        '',
        '# Web settings',
        'TEQFW_WEB__PORT=3000',
        '# Host comment',
        'TEQFW_WEB__HOST="example.test"',
        '',
        '# Application settings',
        'APP_CORE__ZETA=last',
        '# Alpha comment',
        'APP_CORE__ALPHA="first\\nline"',
        'APP_CORE__MULTI="one',
        'two" # quoted value',
        '',
        '# Footer',
    ].join('\n') + '\n';
    const expected = [
        'UNRELATED=one',
        'export ZED=two # retain this',
        '',
        '# Application settings',
        '# Alpha comment',
        'APP_CORE__ALPHA="first\\nline"',
        'APP_CORE__MULTI="one',
        'two" # quoted value',
        'APP_CORE__ZETA=last',
        '',
        '# Web settings',
        '# Host comment',
        'TEQFW_WEB__HOST="example.test"',
        'TEQFW_WEB__PORT=3000',
        '',
        '# Footer',
    ].join('\n') + '\n';
    const sorter = new Sorter();

    const result = sorter.sort(source);

    assert.equal(result, expected);
    assert.equal(sorter.sort(result), result);
});

test('sorter preserves a dotenv file without cfg keys unchanged', () => {
    const source = '# A comment\n\nNODE_ENV=production\nexport OTHER=value\n';

    assert.equal(new Sorter().sort(source), source);
});

test('sorter rejects invalid dotenv syntax without exposing source text', () => {
    assert.throws(() => new Sorter().sort('APP_CORE__VALUE="unclosed\n'), /Invalid dotenv syntax/);
});
