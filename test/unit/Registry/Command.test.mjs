import assert from 'node:assert/strict';
import test from 'node:test';
import CommandRegistry from '../../../src/Registry/Command.mjs';

test('command registry validates input, preserves order, and freezes its catalogue', () => {
    /** @type {TeqFw_Cli_Manifest_Command[]} */ const calls = [];
    const registry = new CommandRegistry(/** @type {any} */ ({descriptorFactory: {create(/** @type {TeqFw_Cli_Manifest_Command} */ data) {
        calls.push(data);
        return Object.freeze({...data});
    }}}));
    const catalogue = registry.build(/** @type {any} */ ([{id: 'a:run'}, {id: 'b:run'}]));

    assert.deepEqual(calls, [{id: 'a:run'}, {id: 'b:run'}]);
    assert.deepEqual(catalogue.map(({id}) => id), ['a:run', 'b:run']);
    assert.ok(Object.isFrozen(catalogue));
    assert.throws(() => registry.build(/** @type {any} */ ({})), /must be an array/);
    assert.throws(() => registry.build(/** @type {any} */ ([{id: 'a:run'}, {id: 'a:run'}])), /Duplicate command id/);
});
