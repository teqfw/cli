import assert from 'node:assert/strict';
import test from 'node:test';
import LifecycleRegistry from '../../src/Registry/Lifecycle.mjs';

test('lifecycle registry validates providers and duplicate participant identities', () => {
    const registry = new LifecycleRegistry();
    assert.deepEqual(registry.build([{getLifecycleParticipants: () => [{id: 'a', initialize: async () => {}}]}]).map((item) => item.id), ['a']);
    assert.throws(() => registry.build([{getLifecycleParticipants: () => [{id: 'a', initialize: async () => {}}, {id: 'a', dispose: async () => {}}]}]), /Duplicate lifecycle participant/);
    assert.throws(() => registry.build([{getLifecycleParticipants: () => [{id: 'empty'}]}]), /no lifecycle hook/);
});
