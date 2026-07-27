import assert from 'node:assert/strict';
import test from 'node:test';
import Parser from '../../src/Adapter/Parser/Internal.mjs';

const command = Object.freeze({
    id: 'test:run', path: Object.freeze(['test', 'run']), summary: 'Run test',
    arguments: Object.freeze([{name: 'count', kind: 'number', required: true, variadic: false}]),
    options: Object.freeze([{name: 'enabled', short: 'e', kind: 'boolean', required: true, repeatable: false}, {name: 'tag', kind: 'string', required: false, repeatable: true, defaultValue: []}]),
});

test('internal parser selects a command with typed parser-neutral input', () => {
    const result = new Parser().select({argv: ['node', 'teq', 'test', 'run', '7', '--enabled=false', '--tag', 'one', '--tag', 'two'], version: '1', commands: [command], io: {write() {}}});
    assert.equal(result.kind, 'command');
    assert.deepEqual(result.args, {count: 7});
    assert.deepEqual(result.options, {enabled: false, tag: ['one', 'two']});
});

test('internal parser provides information and reports stable usage errors', () => {
    const output = [];
    assert.equal(new Parser().select({argv: ['node', 'teq', '--help'], version: '1', commands: [command], io: {write: (text) => output.push(text)}}).kind, 'information');
    assert.match(output.join(''), /TeqFW application host/);
    assert.throws(() => new Parser().select({argv: ['node', 'teq', 'test', 'run', 'wrong', '--enabled'], version: '1', commands: [command], io: {write() {}}}), /finite number/);
    assert.throws(() => new Parser().select({argv: ['node', 'teq', 'unknown'], version: '1', commands: [command], io: {write() {}}}), /unknown command/);
});
