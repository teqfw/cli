// @ts-check

/**
 * @namespace TeqFw_Cli_Host
 * @description Controls application lifecycle, command lifetime, and one shutdown sequence.
 */

/**
 * @param {unknown} error
 * @returns {string}
 */
function message(error) { return error instanceof Error ? error.message : String(error); }

export default class Host {
    /**
     * @param {object} deps
     * @param {TeqFw_Cli_Adapter_Parser_Internal$} deps.parser
     * @param {TeqFw_Cli_Adapter_Signal$} deps.signals
     * @param {TeqFw_Cli_Adapter_Io$} deps.io
     */
    constructor({parser, signals, io}) {
        /**
         * @param {object} input
         * @returns {Promise<number>}
         */
        this.run = async function (input) {
            const {argv, version, commands, participants, defaultCommand, launch} = input;
            const log = launch?.log ?? Object.freeze({info() {}, warn() {}, error() {}});
            let selection;
            try { selection = parser.select({argv, version, commands, io, defaultCommand}); }
            catch (error) { io.error(`${message(error)}\n`); return error?.category === 'usage' ? 2 : 1; }
            if (selection.kind === 'information') return 0;
            const controller = new AbortController();
            let signalCode = 0;
            let primary;
            let shutdownStarted = false;
            const initialized = [];
            const activated = [];
            const context = Object.freeze({signal: controller.signal, launch});
            const unsubscribe = signals.subscribe((signal) => {
                if (signalCode !== 0) return;
                signalCode = signal === 'SIGINT' ? 130 : 143;
                log.warn('Process signal received.', {signal});
                controller.abort(new Error(`Interrupted by ${signal}.`));
            });
            /**
             * @param {object} participant
             * @param {string} hook
             * @param {object[]|undefined} completed
             * @returns {Promise<void>}
             */
            const invoke = async (participant, hook, completed) => {
                if (typeof participant[hook] !== 'function') return;
                log.info('Plugin lifecycle transition started.', {participant: participant.id, hook});
                try { await participant[hook](context); completed?.push(participant); log.info('Plugin lifecycle transition completed.', {participant: participant.id, hook}); }
                catch (error) { log.error('Plugin lifecycle transition failed.', {participant: participant.id, hook, err: error}); throw error; }
            };
            /** @returns {Promise<void>} */
            const shutdown = async () => {
                if (shutdownStarted) return;
                shutdownStarted = true;
                for (const [hook, items] of [['deactivate', activated], ['dispose', initialized]]) {
                    for (const participant of [...items].reverse()) {
                        try { await invoke(participant, hook); } catch (error) { primary ??= error; }
                    }
                }
            };
            try {
                log.info('Application initialization started.');
                for (const participant of participants) await invoke(participant, 'initialize', initialized);
                log.info('Application activation started.');
                for (const participant of participants) await invoke(participant, 'activate', activated);
                const commandContext = Object.freeze({args: selection.args, options: selection.options, signal: controller.signal, launch});
                let commandError;
                try {
                    if (selection.command.lifetime === 'finite') {
                        await selection.command.execute(commandContext);
                    } else {
                        const runtime = await selection.command.start(commandContext);
                        if (!runtime || typeof runtime.stop !== 'function' || !runtime.done || typeof runtime.done.then !== 'function') {
                            throw new TypeError(`Long-running command '${selection.command.id}' must return {stop(), done: Promise}.`);
                        }
                        const stopped = new Promise((resolve) => controller.signal.addEventListener('abort', resolve, {once: true}));
                        const done = Promise.resolve(runtime.done);
                        if (controller.signal.aborted || await Promise.race([done.then(() => false), stopped.then(() => true)])) await runtime.stop();
                        await done;
                    }
                } catch (error) { commandError = error; throw error; }
                finally {
                    if (selection.command.cleanup) {
                        try { await selection.command.cleanup(); }
                        catch (error) { if (commandError) primary ??= commandError; else throw error; }
                    }
                }
            } catch (error) { primary ??= error; }
            finally { await shutdown(); unsubscribe(); }
            log.info('Application outcome determined.', {status: signalCode || (primary ? 1 : 0)});
            if (primary && signalCode === 0) io.error(`${message(primary)}\n`);
            return signalCode || (primary ? 1 : 0);
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
