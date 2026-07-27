// @ts-check
/** @namespace TeqFw_Cli_Adapter_Parser_Internal @description Parses the deliberately small parser-neutral TeqFW command contract. */
/**
 * @param {string} message usage text
 * @returns {Error} categorized error
 */
function usage(message) { const error = new Error(message); error.category = 'usage'; return error; }
/**
 * @param {string} kind target type
 * @param {unknown} value raw value
 * @returns {string|number|boolean} converted value
 */
function convert(kind, value) {
    if (kind === 'string') return String(value);
    if (kind === 'number') { const result = Number(value); if (!Number.isFinite(result)) throw usage(`Expected a finite number, received '${String(value)}'.`); return result; }
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase();
    if ((normalized === 'true') || (normalized === '1')) return true;
    if ((normalized === 'false') || (normalized === '0')) return false;
    throw usage(`Expected a boolean, received '${String(value)}'.`);
}
export default class Internal {
    /** Creates a stateless parser adapter. */
    constructor() {
        /**
         * @param {object} deps invocation input
         * @param {string[]} deps.argv raw process arguments
         * @param {string} deps.version application version
         * @param {object[]} deps.commands command descriptors
         * @param {object} deps.io output adapter
         * @returns {object} selection result
         */
        this.select = function ({argv, version, commands, io}) {
            const input = argv.slice(2);
            if ((input.length === 0) || input.includes('--help') || input.includes('-h')) { io.write(`TeqFW application host\n\nUsage: teq <command> [arguments] [options]\n\nCommands:\n${commands.map((item) => `  ${item.path.join(' ')}  ${item.summary}`).join('\n')}\n`); return {kind: 'information'}; }
            if ((input.length === 1) && (input[0] === '--version')) { io.write(`${version}\n`); return {kind: 'information'}; }
            const command = commands.find((item) => item.path.every((segment, index) => input[index] === segment));
            if (!command) throw usage(`unknown command: '${input.filter((item) => !item.startsWith('-')).join(' ')}'.`);
            const values = input.slice(command.path.length); const args = {}; const options = {};
            for (const option of command.options) options[option.name] = option.defaultValue !== undefined ? (option.repeatable ? [...option.defaultValue] : option.defaultValue) : (option.repeatable ? [] : undefined);
            const positional = [];
            for (let index = 0; index < values.length; index += 1) {
                const value = values[index]; if (!value.startsWith('-')) { positional.push(value); continue; }
                const [flag, inline] = value.split('=', 2); const option = command.options.find((item) => (`--${item.name}` === flag) || (item.short && (`-${item.short}` === flag)));
                if (!option) throw usage(`unknown option: '${flag}'.`);
                let raw = inline; const takesValue = option.kind !== 'boolean' || option.repeatable;
                if (takesValue && raw === undefined) raw = values[++index];
                if (takesValue && ((raw === undefined) || raw.startsWith('--'))) throw usage(`option '--${option.name}' requires a value.`);
                const converted = takesValue ? convert(option.kind, raw) : (raw === undefined ? true : convert('boolean', raw)); options[option.name] = option.repeatable ? [...options[option.name], converted] : converted;
            }
            let position = 0;
            for (const argument of command.arguments) { const raw = argument.variadic ? positional.slice(position) : positional.slice(position, position + 1); position += raw.length; if ((raw.length === 0) && argument.required && argument.defaultValue === undefined) throw usage(`required argument '${argument.name}' is missing.`); args[argument.name] = raw.length === 0 ? argument.defaultValue : (argument.variadic ? raw.map((item) => convert(argument.kind, item)) : convert(argument.kind, raw[0])); }
            if (position !== positional.length) throw usage('too many arguments.');
            for (const option of command.options) if (option.required && ((options[option.name] === undefined) || (option.repeatable && options[option.name].length === 0))) throw usage(`required option '--${option.name}' is missing.`);
            return Object.freeze({kind: 'command', command, args: Object.freeze(args), options: Object.freeze(options)});
        };
    }
}
