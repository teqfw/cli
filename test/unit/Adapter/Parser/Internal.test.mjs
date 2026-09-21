import assert from 'node:assert/strict';
import test from 'node:test';
import Parser from '../../../../src/Adapter/Parser/Internal.mjs';

const command = Object.freeze({
    id: 'fixture:run', summary: 'Run fixture', component: 'Fixture_Command$',
    arguments: Object.freeze([
        Object.freeze({name: 'count', kind: 'number', required: true, variadic: false}),
        Object.freeze({name: 'names', kind: 'string', required: false, variadic: true}),
    ]),
    options: Object.freeze([
        Object.freeze({name: 'verbose', kind: 'boolean', required: false, repeatable: false}),
        Object.freeze({name: 'tag', short: 't', kind: 'string', required: false, repeatable: true, defaultValue: ['base']}),
    ]),
});

test('parser constructs a frozen command selection from arguments and options', () => {
    const result = new Parser().select({
        argv: ['node', 'teq', 'fixture:run', '2', 'Ada', 'Bob', '--verbose', '-t', 'one', '--tag=two'],
        version: '1.0.0', commands: [command], io: {write() {}, error() {}}, defaultCommand: undefined,
    });

    assert.equal(result.kind, 'command');
    assert.deepEqual(result.args, {count: 2, names: ['Ada', 'Bob']});
    assert.deepEqual(result.options, {verbose: true, tag: ['base', 'one', 'two']});
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.args));
    assert.ok(Object.isFrozen(result.options));
});

test('parser reports usage errors for invalid selections without writing output', () => {
    const parser = new Parser();
    const io = {write() { throw new Error('must not write'); }, error() {}};

    assert.throws(
        () => parser.select({argv: ['node', 'teq', 'fixture:run', 'NaN'], version: '1', commands: [command], io, defaultCommand: undefined}),
        (error) => /** @type {any} */ (error).category === 'usage' && /finite number/.test(/** @type {any} */ (error).message),
    );
    assert.throws(
        () => parser.select({argv: ['node', 'teq', 'fixture:run', '1', '--unknown'], version: '1', commands: [command], io, defaultCommand: undefined}),
        (error) => /** @type {any} */ (error).category === 'usage' && /unknown option/.test(/** @type {any} */ (error).message),
    );
});

test('parser accepts the built-in information commands', () => {
    let output = '';
    const io = {write(chunk) { output += chunk; }, error() {}};
    const parser = new Parser();

    assert.deepEqual(parser.select({argv: ['node', 'teq', 'help'], version: '1.2.3', commands: [command], io, defaultCommand: undefined}), {kind: 'information'});
    assert.match(output, /TeqFW application launcher/);
    output = '';
    assert.deepEqual(parser.select({argv: ['node', 'teq', '--version'], version: '1.2.3', commands: [command], io, defaultCommand: undefined}), {kind: 'information'});
    assert.equal(output, '1.2.3\n');
});
