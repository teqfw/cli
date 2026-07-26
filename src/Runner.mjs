// @ts-check

/**
 * @namespace TeqFw_Cli_Runner
 * @description Owns parsing, command execution, cancellation, cleanup, diagnostics, and status mapping.
 */

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

export default class Runner {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Adapter_Parser_Commander$} deps.parser
     * @param {TeqFw_Cli_Adapter_Signal$} deps.signals
     * @param {TeqFw_Cli_Adapter_Io$} deps.io
     * @param {TeqFw_Cli_Util_DeepFreeze} deps.freeze
     */
    constructor({parser, signals, io, freeze}) {
        /**
         * @param {object} deps
         * @param {object} deps.argv
         * @param {string} deps.version
         * @param {object} deps.commands
         * @returns {Promise<number>}
         */
        this.run = async function ({argv, version, commands}) {
            const controller = new AbortController();
            let signalCode = 0;
            let selected = false;
            const unsubscribe = signals.subscribe((signal) => {
                if (signalCode !== 0) return;
                signalCode = signal === 'SIGINT' ? 130 : 143;
                controller.abort(new Error(`Interrupted by ${signal}.`));
            });

            try {
                await parser.parse({
                    argv,
                    version,
                    commands,
                    io,
                    onExecute: async (command, rawArgs, rawOptions) => {
                        if (selected) throw new Error('Only one command may execute per invocation.');
                        selected = true;
                        const args = freeze({...rawArgs});
                        const options = freeze({...rawOptions});
                        const context = freeze({args, options, signal: controller.signal});
                        let executionError;
                        try {
                            return await command.execute(context);
                        } catch (error) {
                            executionError = error;
                            throw error;
                        } finally {
                            if (command.cleanup) {
                                try {
                                    await command.cleanup();
                                } catch (cleanupError) {
                                    if (executionError !== undefined) {
                                        io.error(`Cleanup failed: ${errorMessage(cleanupError)}\n`);
                                    } else {
                                        throw cleanupError;
                                    }
                                }
                            }
                        }
                    },
                });
                return signalCode || 0;
            } catch (error) {
                if (signalCode !== 0) return signalCode;
                if (error?.category === 'usage') {
                    if (error.reported !== true) io.error(`${errorMessage(error)}\n`);
                    return 2;
                }
                io.error(`${errorMessage(error)}\n`);
                return 1;
            } finally {
                unsubscribe();
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        parser: 'TeqFw_Cli_Adapter_Parser_Commander$$',
        signals: 'TeqFw_Cli_Adapter_Signal$',
        io: 'TeqFw_Cli_Adapter_Io$',
        freeze: 'TeqFw_Cli_Util_DeepFreeze__default',
    }),
});
