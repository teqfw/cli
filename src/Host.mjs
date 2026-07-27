// @ts-check

/**
 * @namespace TeqFw_Cli_Host
 * @description Controls the TeqFW application lifecycle and a selected command execution.
 */

/**
 * @param {unknown} error failure value
 * @returns {string} safe message
 */
function message(error) {
    return error instanceof Error ? error.message : String(error);
}

export default class Host {
    /**
     * @param {object} deps construction dependencies
     * @param {object} deps.parser parser adapter
     * @param {object} deps.signals signal adapter
     * @param {object} deps.io output adapter
     * @param {object} deps.loggerProvider log provider
     */
    constructor({parser, signals, io, loggerProvider}) {
        const log = loggerProvider.forSource("TeqFw_Cli_Host");
        /**
         * @param {object} deps assembled invocation
         * @param {string[]} deps.argv raw process arguments
         * @param {string} deps.version application version
         * @param {object[]} deps.commands command products
         * @param {object[]} deps.participants lifecycle products
         * @returns {Promise<number>} process result
         */
        this.run = async function ({argv, version, commands, participants}) {
            let selection;
            try {
                selection = parser.select({argv, version, commands, io});
            } catch (error) {
                io.error(`${message(error)}\n`);
                return error?.category === 'usage' ? 2 : 1;
            }
            if (selection.kind === 'information') return 0;
            const controller = new AbortController();
            let signalCode = 0;
            let primary;
            const initialized = [];
            const activated = [];
            const context = Object.freeze({signal: controller.signal});
            const unsubscribe = signals.subscribe((signal) => {
                if (signalCode !== 0) return;
                signalCode = signal === "SIGINT" ? 130 : 143;
                log.warn("Process signal received.", {signal});
                controller.abort(new Error(`Interrupted by ${signal}.`));
            });
            /**
             * @param {object} participant lifecycle participant
             * @param {string} hook lifecycle hook name
             * @param {object[]|undefined} completed successful participants
             * @returns {Promise<void>} invocation completion
             */
            const invoke = async (participant, hook, completed) => {
                if (typeof participant[hook] !== "function") { log.debug("Plugin lifecycle hook skipped.", {participant: participant.id, hook}); return; }
                log.info("Plugin lifecycle hook started.", {participant: participant.id, hook});
                try { await participant[hook](context); completed?.push(participant); log.info("Plugin lifecycle hook completed.", {participant: participant.id, hook}); }
                catch (error) { log.error("Plugin lifecycle hook failed.", {participant: participant.id, hook, err: error}); throw error; }
            };
            /**
             * @returns {Promise<void>} shutdown completion
             */
            const shutdown = async () => {
                for (const [hook, items] of [['deactivate', activated], ['dispose', initialized]]) {
                    log.info(`${hook[0].toUpperCase()}${hook.slice(1)} phase started.`);
                    for (const participant of [...items].reverse()) {
                        try { await invoke(participant, hook); } catch (error) { primary ??= error; }
                    }
                    log.info(`${hook[0].toUpperCase()}${hook.slice(1)} phase completed.`);
                }
            };
            try {
                log.info('Initialization phase started.');
                for (const participant of participants) await invoke(participant, 'initialize', initialized);
                log.info('Initialization phase completed.');
                log.info('Activation phase started.');
                for (const participant of participants) await invoke(participant, 'activate', activated);
                log.info('Activation phase completed.');
                log.info('Run phase started.', {command: selection.command.id});
                let commandError;
                try {
                    await selection.command.execute(Object.freeze({args: selection.args, options: selection.options, signal: controller.signal}));
                } catch (error) {
                    commandError = error;
                    throw error;
                } finally {
                    if (selection.command.cleanup) {
                        try { await selection.command.cleanup(); } catch (error) { if (commandError) log.error('Command cleanup failed.', {err: error}); else throw error; }
                    }
                }
                log.info('Run phase completed.', {command: selection.command.id});
            } catch (error) {
                primary ??= error;
                log.error('Host phase failed.', {err: error});
            } finally {
                await shutdown();
                unsubscribe();
            }
            const status = signalCode || (primary ? 1 : 0);
            log.info('Final process outcome.', {status, clean: status === 0});
            if (primary && signalCode === 0) io.error(`${message(primary)}\n`);
            return status;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        parser: 'TeqFw_Cli_Adapter_Parser_Internal$',
        signals: 'TeqFw_Cli_Adapter_Signal$',
        io: 'TeqFw_Cli_Adapter_Io$',
        loggerProvider: 'TeqFw_Log_Provider$',
    }),
});
