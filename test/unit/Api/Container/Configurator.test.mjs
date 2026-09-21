import assert from 'node:assert/strict';
import test from 'node:test';
import Configurator from '../../../../src/Api/Container/Configurator.mjs';

test('configurator contract refuses to configure a container directly', () => {
    assert.throws(
        () => new Configurator().configure({applicationRoot: '/app', argv: []}),
        /is a contract and cannot configure a Container itself/,
    );
});
