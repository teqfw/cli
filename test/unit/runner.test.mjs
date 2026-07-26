import assert from 'node:assert/strict';
import test from 'node:test';
import deepFreeze from '../../src/Util/DeepFreeze.mjs';
import Runner from '../../src/Runner.mjs';

function makeHarness(parse) {
    const stdout = [];
    const stderr = [];
    let signalHandler;
    let unsubscribeCount = 0;
    const runner = new Runner({
        parser: {parse},
        signals: {
            subscribe(handler) {
                signalHandler = handler;
                return () => { unsubscribeCount += 1; };
            },
        },
        io: {
            write(message) { stdout.push(message); },
            error(message) { stderr.push(message); },
        },
        freeze: deepFreeze,
    });
    return {
        runner,
        stdout,
        stderr,
        emit(signal) { signalHandler(signal); },
        get unsubscribeCount() { return unsubscribeCount; },
    };
}

test('runner executes with frozen context and cleans up exactly once after success', async () => {
    let cleanupCount = 0;
    let context;
    const command = {
        async execute(value) {
            context = value;
        },
        async cleanup() {
            cleanupCount += 1;
        },
    };
    const harness = makeHarness(async ({onExecute}) => {
        await onExecute(command, {count: 2}, {verbose: true});
    });

    assert.equal(await harness.runner.run({argv: [], version: 'x', commands: [command]}), 0);
    assert.equal(cleanupCount, 1);
    assert.equal(context.signal instanceof AbortSignal, true);
    assert.equal(Object.isFrozen(context), true);
    assert.equal(Object.isFrozen(context.args), true);
    assert.equal(Object.isFrozen(context.options), true);
    assert.equal(harness.unsubscribeCount, 1);
});

test('runner preserves execution error and reports secondary cleanup error', async () => {
    const command = {
        async execute() {
            throw new Error('execution failed');
        },
        async cleanup() {
            throw new Error('cleanup failed');
        },
    };
    const harness = makeHarness(async ({onExecute}) => onExecute(command, {}, {}));

    assert.equal(await harness.runner.run({argv: [], version: 'x', commands: [command]}), 1);
    assert.deepEqual(harness.stderr, ['Cleanup failed: cleanup failed\n', 'execution failed\n']);
});

test('runner maps usage errors and does not clean an unselected command', async () => {
    let cleanupCount = 0;
    const command = {async execute() {}, cleanup() { cleanupCount += 1; }};
    const harness = makeHarness(async () => {
        const error = new Error('bad input');
        error.category = 'usage';
        error.reported = false;
        throw error;
    });

    assert.equal(await harness.runner.run({argv: [], version: 'x', commands: [command]}), 2);
    assert.deepEqual(harness.stderr, ['bad input\n']);
    assert.equal(cleanupCount, 0);
});

test('runner aborts with signal-specific status and still cleans up', async () => {
    let cleanupCount = 0;
    let observedSignal;
    const command = {
        async execute({signal}) {
            observedSignal = signal;
            assert.equal(signal.aborted, true);
            throw signal.reason;
        },
        async cleanup() {
            cleanupCount += 1;
        },
    };
    const harness = makeHarness(async ({onExecute}) => {
        harness.emit('SIGINT');
        await onExecute(command, {}, {});
    });

    assert.equal(await harness.runner.run({argv: [], version: 'x', commands: [command]}), 130);
    assert.equal(observedSignal.aborted, true);
    assert.equal(cleanupCount, 1);
    assert.deepEqual(harness.stderr, []);
});

test('runner maps SIGTERM to 143', async () => {
    const harness = makeHarness(async () => {
        harness.emit('SIGTERM');
    });
    assert.equal(await harness.runner.run({argv: [], version: 'x', commands: []}), 143);
});
