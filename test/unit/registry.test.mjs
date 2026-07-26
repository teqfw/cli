import assert from 'node:assert/strict';
import test from 'node:test';
import deepFreeze from '../../src/Util/DeepFreeze.mjs';
import ProviderRegistry from '../../src/Registry/Provider.mjs';
import CommandRegistry from '../../src/Registry/Command.mjs';
import {Factory as ArgumentFactory} from '../../src/Dto/Argument.mjs';
import {Factory as OptionFactory} from '../../src/Dto/Option.mjs';
import {Factory as CommandFactory} from '../../src/Dto/Command.mjs';

const argumentFactory = new ArgumentFactory({freeze: deepFreeze});
const optionFactory = new OptionFactory({freeze: deepFreeze});
const commandFactory = new CommandFactory({argumentFactory, optionFactory, freeze: deepFreeze});
const commandRegistry = new CommandRegistry({commandFactory});

const packageRecord = (name, cli) => ({
    name,
    rootAbs: `/${name}`,
    rootReal: `/${name}`,
    packageJson: cli === undefined ? {name} : {name, teqfw: {providers: {cli}}},
});

const makeCommand = (id, path) => commandFactory.create({
    id,
    path,
    summary: id,
    arguments: [],
    options: [],
    execute: async () => {},
});

test('provider registry preserves graph/declaration order', async () => {
    const packageGraph = {
        async build() {
            return [
                packageRecord('root', ['Root_Provider$', 'Root_Second$']),
                packageRecord('dependency', ['Dependency_Provider$']),
            ];
        },
    };
    const registry = new ProviderRegistry({packageGraph});
    const result = await registry.build();
    assert.deepEqual(result, ['Root_Provider$', 'Root_Second$', 'Dependency_Provider$']);
    assert.equal(Object.isFrozen(result), true);
});

test('provider registry rejects duplicate and malformed metadata', async () => {
    const duplicate = new ProviderRegistry({
        packageGraph: {
            async build() {
                return [
                    packageRecord('a', ['Same_Provider$']),
                    packageRecord('b', ['Same_Provider$']),
                ];
            },
        },
    });
    await assert.rejects(() => duplicate.build(), /Duplicate CLI provider token/);

    const invalid = new ProviderRegistry({
        packageGraph: {async build() { return [packageRecord('a', ['not/a/provider'])]; }},
    });
    await assert.rejects(() => invalid.build(), /Invalid CLI provider token/);

    const badShape = new ProviderRegistry({
        packageGraph: {
            async build() {
                return [{...packageRecord('a'), packageJson: {name: 'a', teqfw: {providers: {cli: 'bad'}}}}];
            },
        },
    });
    await assert.rejects(() => badShape.build(), /must be an array/);
});

test('command registry rejects mutable providers and duplicate IDs or paths', () => {
    const first = makeCommand('demo:first', ['demo', 'first']);
    assert.throws(
        () => commandRegistry.build([{getCommands: () => [first]}]),
        /immutable array/,
    );

    const duplicateId = makeCommand('demo:first', ['demo', 'second']);
    assert.throws(
        () => commandRegistry.build([
            {getCommands: () => Object.freeze([first])},
            {getCommands: () => Object.freeze([duplicateId])},
        ]),
        /Duplicate command id/,
    );

    const duplicatePath = makeCommand('demo:other', ['demo', 'first']);
    assert.throws(
        () => commandRegistry.build([
            {getCommands: () => Object.freeze([first, duplicatePath])},
        ]),
        /Duplicate command path/,
    );
});

test('command registry keeps provider and command ordering', () => {
    const first = makeCommand('a', ['a']);
    const second = makeCommand('b', ['b']);
    const third = makeCommand('c', ['c']);
    const result = commandRegistry.build([
        {getCommands: () => Object.freeze([first, second])},
        {getCommands: () => Object.freeze([third])},
    ]);
    assert.deepEqual(result.map((item) => item.id), ['a', 'b', 'c']);
    assert.equal(Object.isFrozen(result), true);
});
