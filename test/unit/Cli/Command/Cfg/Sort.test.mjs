import assert from 'node:assert/strict';
import test from 'node:test';
import Sort from '../../../../../src/Cli/Command/Cfg/Sort.mjs';

test('command rejects incompatible check and dry-run modes before reading a file', async () => {
    const command = /** @type {any} */ (new Sort(/** @type {any} */ ({
        config: {applicationRoot: '/app', cwd: '/cwd'},
        sorter: {sort: () => ''},
        fs: {readFile: async () => { throw new Error('must not read'); }},
        path: {join: (...parts) => parts.join('/'), resolve: (...parts) => parts.join('/')},
        io: {write: () => {}},
    })));

    await assert.rejects(
        () => command.execute({args: {file: undefined}, options: {check: true, 'dry-run': true}}),
        /cannot be used together/,
    );
});
