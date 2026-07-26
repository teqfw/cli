// @ts-check

/**
 * @namespace TeqFw_Cli_Adapter_Parser_Commander
 * @description Private Commander adapter for command construction, typed parsing, help, and version.
 */

/**
 * @param {'string'|'number'|'boolean'} kind
 * @param {unknown} value
 * @returns {string|number|boolean}
 */
function convert(kind, value) {
    if (kind === 'string') return String(value);
    if (kind === 'number') {
        const result = Number(value);
        if (!Number.isFinite(result)) throw new TypeError(`Expected a finite number, received '${String(value)}'.`);
        return result;
    }
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase();
    if ((normalized === 'true') || (normalized === '1')) return true;
    if ((normalized === 'false') || (normalized === '0')) return false;
    throw new TypeError(`Expected a boolean, received '${String(value)}'.`);
}

export default class Commander {
    /**
     * @param {object} deps
     * @param {any} deps.CommandClass
     * @param {any} deps.OptionClass
     * @param {TeqFw_Cli_Error} deps.createError
     */
    constructor({CommandClass, OptionClass, createError}) {
        /**
         * @param {object} deps
         * @param {object} deps.commands
         * @param {object} deps.argv
         * @param {string} deps.version
         * @param {object} deps.io
         * @param {object} deps.onExecute
         * @returns {Promise<string>}
         */
        this.parse = async function ({commands, argv, version, io, onExecute}) {
            const program = new CommandClass();
            program
                .name('teq')
                .description('TeqFW command-line host')
                .version(version)
                .exitOverride()
                .configureOutput({
                    writeOut: (message) => io.write(message),
                    writeErr: (message) => io.error(message),
                });

            /** @type {Map<string, {node: any, configured: boolean}>} */
            const nodes = new Map();
            nodes.set('', {node: program, configured: false});

            for (const descriptor of commands) {
                let parent = program;
                let key = '';
                for (let index = 0; index < descriptor.path.length; index += 1) {
                    const segment = descriptor.path[index];
                    key = key ? `${key}\u0000${segment}` : segment;
                    let entry = nodes.get(key);
                    if (!entry) {
                        const node = new CommandClass(segment);
                        node.exitOverride();
                        node.configureOutput({
                            writeOut: (message) => io.write(message),
                            writeErr: (message) => io.error(message),
                        });
                        node.description(`Commands under ${descriptor.path.slice(0, index + 1).join(' ')}.`);
                        parent.addCommand(node);
                        entry = {node, configured: false};
                        nodes.set(key, entry);
                    }
                    parent = entry.node;
                    if (index !== descriptor.path.length - 1) continue;
                    if (entry.configured) throw new Error(`Command path configured twice: '${descriptor.path.join(' ')}'.`);
                    entry.configured = true;
                    const leaf = entry.node;
                    leaf.description(descriptor.summary);
                    if (descriptor.description) leaf.addHelpText('after', `\n${descriptor.description}\n`);

                    for (const argument of descriptor.arguments) {
                        const marker = argument.required
                            ? `<${argument.name}${argument.variadic ? '...' : ''}>`
                            : `[${argument.name}${argument.variadic ? '...' : ''}]`;
                        const parser = argument.variadic
                            ? (value, previous = []) => [...previous, convert(argument.kind, value)]
                            : (value) => convert(argument.kind, value);
                        if (argument.defaultValue === undefined) {
                            leaf.argument(marker, argument.description, parser);
                        } else {
                            leaf.argument(marker, argument.description, parser, argument.defaultValue);
                        }
                    }

                    const optionMap = [];
                    for (const option of descriptor.options) {
                        const takesValue = (option.kind !== 'boolean') || option.repeatable;
                        const flags = `${option.short ? `-${option.short}, ` : ''}--${option.name}`
                            + `${takesValue ? ` <${option.kind}>` : ''}`;
                        const parserOption = new OptionClass(flags, option.description);
                        if (option.required) parserOption.makeOptionMandatory();
                        if (takesValue) {
                            parserOption.argParser(option.repeatable
                                ? (value, previous = []) => [...previous, convert(option.kind, value)]
                                : (value) => convert(option.kind, value));
                        }
                        if (option.defaultValue !== undefined) parserOption.default(option.defaultValue);
                        leaf.addOption(parserOption);
                        optionMap.push({descriptor: option, attribute: parserOption.attributeName()});
                    }

                    leaf.action(async (...values) => {
                        const args = {};
                        for (let argIndex = 0; argIndex < descriptor.arguments.length; argIndex += 1) {
                            args[descriptor.arguments[argIndex].name] = values[argIndex];
                        }
                        const options = {};
                        for (const mapping of optionMap) {
                            options[mapping.descriptor.name] = leaf.getOptionValue(mapping.attribute);
                        }
                        return onExecute(descriptor, args, options);
                    });
                }
            }

            try {
                if (argv.length <= 2) {
                    program.outputHelp();
                    return 'help';
                }
                await program.parseAsync(argv, {from: 'node'});
                return 'completed';
            } catch (cause) {
                if (cause?.code === 'commander.helpDisplayed') return 'help';
                if (cause?.code === 'commander.version') return 'version';
                if (cause?.code?.startsWith('commander.')) {
                    throw createError('usage', cause.message, {cause, reported: true});
                }
                throw cause;
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        CommandClass: 'npm:commander__Command',
        OptionClass: 'npm:commander__Option',
        createError: 'TeqFw_Cli_Error__default',
    }),
});
