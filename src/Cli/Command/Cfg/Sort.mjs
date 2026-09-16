// @ts-check

/**
 * @namespace TeqFw_Cli_Cli_Command_Cfg_Sort
 * @description Finite command that atomically orders a valid dotenv file.
 */
export default class Sort {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Config} deps.config
     * @param {TeqFw_Cli_Env_Sorter} deps.sorter
     * @param {TeqFw_Cli_Node_Fs} deps.fs
     * @param {TeqFw_Cli_Node_Path} deps.path
     * @param {TeqFw_Cli_Adapter_Io} deps.io
     */
    constructor({config, sorter, fs, path, io}) {
        return {
            id: 'cfg:sort',
            summary: 'Order a valid dotenv configuration file.',
            lifetime: 'finite',
            arguments: [{name: 'file', kind: 'string', required: false, description: 'Dotenv file path, relative to the launch cwd.'}],
            options: [
                {name: 'check', kind: 'boolean', description: 'Fail when the file requires ordering.'},
                {name: 'dry-run', kind: 'boolean', description: 'Report a pending rewrite without changing the file.'},
            ],
            /** @param {TeqFw_Cli_Host_Command_Selection} context */
            execute: async (context) => {
                const {file} = context.args;
                const check = context.options.check;
                const dryRun = context.options['dry-run'];
                if (check && dryRun) throw new Error("Options '--check' and '--dry-run' cannot be used together.");
                const target = file === undefined ? path.join(config.applicationRoot, '.env') : path.resolve(config.cwd, /** @type {string} */ (file));
                const source = await fs.readFile(target, 'utf8');
                const ordered = sorter.sort(source);
                if (ordered === source) {
                    io.write('Configuration file is already ordered.\n');
                    return;
                }
                if (check) throw new Error('Configuration file requires ordering.');
                if (dryRun) {
                    io.write('Configuration file would be ordered.\n');
                    return;
                }
                const stat = await fs.stat(target);
                const temporary = path.join(path.dirname(target), `.${path.basename(target)}.teqfw-sort-${process.pid}-${Date.now()}`);
                try {
                    await fs.writeFile(temporary, ordered, 'utf8');
                    await fs.chmod(temporary, stat.mode);
                    await fs.rename(temporary, target);
                } catch (error) {
                    await fs.unlink(temporary).catch(() => {});
                    throw error;
                }
                io.write('Configuration file ordered.\n');
            },
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        config: 'TeqFw_Cli_Config$',
        sorter: 'TeqFw_Cli_Env_Sorter$',
        fs: 'node:fs/promises',
        path: 'node:path',
        io: 'TeqFw_Cli_Adapter_Io$',
    }),
});
