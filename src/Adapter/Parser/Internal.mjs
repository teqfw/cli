// @ts-check
/**
 * @namespace TeqFw_Cli_Adapter_Parser_Internal
 * @description Parses the deliberately small parser-neutral command contract.
 */
/**
 * @param {string} message
 * @returns {Error}
 */
function usage(message) { return /** @type {Error & {category: 'usage'}} */ (Object.assign(new Error(message), {category: 'usage'})); }
/**
 * @param {string} kind
 * @param {unknown} value
 * @returns {string|number|boolean}
 */
function convert(kind, value) {
    if (kind === 'string') return String(value);
    if (kind === 'number') { const result = Number(value); if (!Number.isFinite(result)) throw usage(`Expected a finite number, received '${String(value)}'.`); return result; }
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    throw usage(`Expected a boolean, received '${String(value)}'.`);
}
/**
 * @param {ReadonlyArray<TeqFw_Cli_Dto_Command_Descriptor>} commands
 * @param {TeqFw_Cli_Adapter_Io} io
 * @returns {void}
 */
function help(commands, io) { io.write(`TeqFW application launcher\n\nUsage: teq <command> [arguments] [options]\n\nCommands:\n${commands.map((item) => `  ${item.id}  ${item.summary}`).join('\n')}\n`); }
export default class Internal {
    /** Creates the parser adapter. */
    constructor() {
        /**
         * @param {object} deps
         * @param {ReadonlyArray<string>} deps.argv
         * @param {string} deps.version
         * @param {ReadonlyArray<TeqFw_Cli_Dto_Command_Descriptor>} deps.commands
         * @param {TeqFw_Cli_Adapter_Io} deps.io
         * @param {string|undefined} deps.defaultCommand
         * @returns {object}
         */
        this.select = function ({argv, version, commands, io, defaultCommand}) {
            const input = argv.slice(2);
            if (input.includes('--help') || input.includes('-h') || input.includes('help')) { help(commands, io); return {kind: 'information'}; }
            if (input.length === 1 && (input[0] === '--version' || input[0] === 'version')) { io.write(`${version}\n`); return {kind: 'information'}; }
            if (input.length === 0 && !defaultCommand) { help(commands, io); return {kind: 'information'}; }
            const command = input.length === 0 ? commands.find((item) => item.id === defaultCommand) : commands.find((item) => item.id === input[0]);
            if (!command) throw usage(input.length === 0 ? `default command '${defaultCommand}' is not available.` : `unknown command: '${input.filter((item) => !item.startsWith('-')).join(' ')}'.`);
            const values = input.slice(1); const args = /** @type {Record<string, any>} */ ({}); const options = /** @type {Record<string, any>} */ ({});
            for (const option of command.options) options[option.name] = option.defaultValue !== undefined ? (option.repeatable && Array.isArray(option.defaultValue) ? [...option.defaultValue] : option.defaultValue) : (option.repeatable ? [] : undefined);
            const positional = [];
            for (let index = 0; index < values.length; index += 1) {
                const value = values[index]; if (!value.startsWith('-')) { positional.push(value); continue; }
                const [flag, inline] = value.split('=', 2); const option = command.options.find((item) => `--${item.name}` === flag || (item.short && `-${item.short}` === flag));
                if (!option) throw usage(`unknown option: '${flag}'.`);
                let raw = inline; const takesValue = option.kind !== 'boolean' || option.repeatable;
                if (takesValue && raw === undefined) raw = values[++index];
                if (takesValue && (raw === undefined || raw.startsWith('--'))) throw usage(`option '--${option.name}' requires a value.`);
                const converted = takesValue ? convert(option.kind, raw) : (raw === undefined ? true : convert('boolean', raw)); options[option.name] = option.repeatable ? [...options[option.name], converted] : converted;
            }
            let position = 0;
            for (const argument of command.arguments) { const raw = argument.variadic ? positional.slice(position) : positional.slice(position, position + 1); position += raw.length; if (raw.length === 0 && argument.required && argument.defaultValue === undefined) throw usage(`required argument '${argument.name}' is missing.`); args[argument.name] = raw.length === 0 ? argument.defaultValue : (argument.variadic ? raw.map((item) => convert(argument.kind, item)) : convert(argument.kind, raw[0])); }
            if (position !== positional.length) throw usage('too many arguments.');
            for (const option of command.options) if (option.required && (options[option.name] === undefined || (option.repeatable && options[option.name].length === 0))) throw usage(`required option '--${option.name}' is missing.`);
            return Object.freeze({kind: 'command', command, args: Object.freeze(args), options: Object.freeze(options)});
        };
    }
}
