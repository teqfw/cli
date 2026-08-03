// @ts-check

/**
 * @namespace TeqFw_Cli_Host
 * @description Opens private runtime sessions for selection, command execution, and one shutdown sequence.
 */

/**
 * @param {unknown} error
 * @returns {string}
 */
function message(error) { return error instanceof Error ? error.message : String(error); }

export default class Host {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Adapter_Parser_Internal} deps.parser
     * @param {TeqFw_Cli_Adapter_Signal} deps.signals
     * @param {TeqFw_Cli_Adapter_Io} deps.io
     */
    constructor({parser, signals, io}) {
        /**
         * @param {object} input
         * @param {ReadonlyArray<string>} input.argv
         * @param {string} input.version
         * @param {ReadonlyArray<TeqFw_Cli_Dto_Command_Descriptor>} input.commands
         * @param {string|undefined} input.defaultCommand
         * @param {TeqFw_Cli_Launch_Context} input.launch
         * @returns {TeqFw_Cli_Host_Session}
         */
        this.open = function (input) {
            const {argv, version, commands, defaultCommand, launch} = input;
            const controller = new AbortController();
            /** @type {TeqFw_Cli_Process_Status} */
            let signalCode = 0;
            /** @type {unknown} */
            let primary;
            let closed = false;
            /** @type {TeqFw_Cli_Api_Plugin[]} */
            const started = [];
            const unsubscribe = signals.subscribe((signal) => {
                if (signalCode !== 0) return;
                signalCode = signal === 'SIGINT' ? 130 : 143;
                controller.abort(new Error(`Interrupted by ${signal}.`));
            });
            /**
             * @param {unknown} error
             * @returns {void}
             */
            const fail = (error) => { primary ??= error; };
            /**
             * @param {TeqFw_Cli_Api_Plugin} plugin
             * @returns {Promise<void>}
             */
            const start = async (plugin) => {
                if (controller.signal.aborted) return;
                try {
                    await plugin.onStartup();
                    started.push(plugin);
                } catch (error) {
                    fail(error);
                    throw error;
                }
            };
            /**
             * @param {TeqFw_Cli_Host_Command_Selection} selection
             * @param {TeqFw_Cli_Dto_Command} command
             * @returns {Promise<void>}
             */
            const execute = async (selection, command) => {
                const commandContext = Object.freeze({args: selection.args, options: selection.options, signal: controller.signal, launch});
                try {
                    if (command.lifetime === 'finite') {
                        await command.execute(commandContext);
                    } else {
                        const runtime = await command.start(commandContext);
                        if (!runtime || typeof runtime.stop !== 'function' || !runtime.done || typeof runtime.done.then !== 'function') {
                            throw new TypeError(`Long-running command '${command.id}' must return {stop(), done: Promise}.`);
                        }
                        const stopped = new Promise((resolve) => controller.signal.addEventListener('abort', resolve, {once: true}));
                        const done = Promise.resolve(runtime.done);
                        if (controller.signal.aborted || await Promise.race([done.then(() => false), stopped.then(() => true)])) await runtime.stop();
                        await done;
                    }
                } catch (error) {
                    fail(error);
                    throw error;
                } finally {
                    if (command.cleanup) {
                        try { await command.cleanup(); }
                        catch (error) { fail(error); }
                    }
                }
            };
            /** @returns {TeqFw_Cli_Host_Selection} */
            const select = function () {
                if (controller.signal.aborted) return Object.freeze({kind: 'interrupted'});
                try {
                    return /** @type {TeqFw_Cli_Host_Command_Selection|Readonly<{kind: 'information'}>} */ (parser.select({argv, version, commands, io, defaultCommand}));
                } catch (error) {
                    io.error(`${message(error)}\n`);
                    const status = /** @type {TeqFw_Cli_Process_Status} */ ((typeof error === 'object' && error !== null && 'category' in error && error.category === 'usage') ? 2 : 1);
                    return Object.freeze({kind: 'failure', status});
                }
            };
            /**
             * @param {TeqFw_Cli_Process_Status} status
             * @returns {Promise<TeqFw_Cli_Process_Status>}
             */
            const close = async function (status = 0) {
                if (closed) return signalCode || (primary ? 1 : status);
                closed = true;
                for (const plugin of [...started].reverse()) {
                    try { await plugin.onShutdown(); } catch (error) { fail(error); }
                }
                unsubscribe();
                if (primary && signalCode === 0) io.error(`${message(primary)}\n`);
                return signalCode || (primary ? 1 : status);
            };
            return Object.freeze({
                close,
                execute,
                fail,
                isInterrupted: () => controller.signal.aborted,
                select,
                start,
            });
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        parser: 'TeqFw_Cli_Adapter_Parser_Internal$',
        signals: 'TeqFw_Cli_Adapter_Signal$',
        io: 'TeqFw_Cli_Adapter_Io$',
    }),
});
