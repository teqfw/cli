// @ts-check

/**
 * @namespace TeqFw_Cli_Env_Sorter
 * @description Preserves dotenv syntax while canonically ordering TeqFW cfg groups.
 */

const CFG_KEY = /^([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)__([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)$/;

/** @param {string} source @param {number} index @returns {number} */
function skipLine(source, index) {
    while (index < source.length && source[index] !== '\n' && source[index] !== '\r') index += 1;
    if (source[index] === '\r' && source[index + 1] === '\n') return index + 2;
    return index < source.length ? index + 1 : index;
}

/** @param {string} char @returns {boolean} */
function isHorizontal(char) { return char === ' ' || char === '\t'; }

/** @param {string} char @returns {boolean} */
function isWhitespace(char) { return isHorizontal(char) || char === '\n' || char === '\r'; }

/** @param {string} text @returns {string} */
function withoutFinalNewline(text) { return text.replace(/\r\n$|[\r\n]$/, ''); }

/** @param {string} source @param {number} index @returns {TeqFw_Cli_Env_Sorter_Scan} */
function scanAssignment(source, index) {
    let cursor = index;
    if (source.startsWith('export', cursor) && isWhitespace(source[cursor + 6])) {
        cursor += 6;
        while (isHorizontal(source[cursor])) cursor += 1;
    }
    const nameStart = cursor;
    while (cursor < source.length && source[cursor] !== '=' && !isWhitespace(source[cursor])) cursor += 1;
    if (cursor === nameStart) throw new Error('Invalid dotenv syntax.');
    const key = source.slice(nameStart, cursor);
    while (isHorizontal(source[cursor])) cursor += 1;
    if (source[cursor] !== '=') throw new Error('Invalid dotenv syntax.');
    cursor += 1;
    while (isHorizontal(source[cursor])) cursor += 1;
    const quote = source[cursor];
    if (quote !== '\'' && quote !== '"') return {end: skipLine(source, cursor), key};
    cursor += 1;
    while (cursor < source.length) {
        const char = source[cursor++];
        if (char === quote) {
            while (isHorizontal(source[cursor])) cursor += 1;
            if (source[cursor] && source[cursor] !== '#' && source[cursor] !== '\n' && source[cursor] !== '\r') {
                throw new Error('Invalid dotenv syntax.');
            }
            return {end: skipLine(source, cursor), key};
        }
        if (quote === '"' && char === '\\') {
            const escaped = source[cursor++];
            if (!['\\', '"', 'n', 'r', 't'].includes(escaped)) throw new Error('Invalid dotenv syntax.');
        }
    }
    throw new Error('Invalid dotenv syntax.');
}

/** @param {string} source @returns {TeqFw_Cli_Env_Sorter_Token_List} */
function tokenize(source) {
    /** @type {TeqFw_Cli_Env_Sorter_Token[]} */
    const result = [];
    let index = source.charCodeAt(0) === 0xfeff ? 1 : 0;
    while (index < source.length) {
        const start = index;
        while (isHorizontal(source[index])) index += 1;
        if (source[index] === '\n' || source[index] === '\r') {
            index = skipLine(source, index);
            result.push({kind: 'blank', raw: source.slice(start, index)});
        } else if (source[index] === '#') {
            index = skipLine(source, index);
            result.push({kind: 'comment', raw: source.slice(start, index)});
        } else {
            const scanned = scanAssignment(source, index);
            index = scanned.end;
            result.push({kind: 'assignment', raw: source.slice(start, index), key: scanned.key});
        }
    }
    return result;
}

export default class Sorter {
    /** Initializes the dotenv ordering service. */
    constructor() {
        /** @param {string} source @returns {string} */
        this.sort = function (source) {
        if (typeof source !== 'string') throw new TypeError('Dotenv source must be a string.');
        const bom = source.charCodeAt(0) === 0xfeff ? '\ufeff' : '';
        const tokens = tokenize(source);
        const eol = source.includes('\r\n') ? '\r\n' : (source.includes('\n') ? '\n' : '\r');
        const hasFinalNewline = /\r\n$|[\r\n]$/.test(source);
        /** @type {Array<{raw: string, index: number}>} */
        const nonCfg = [];
        /** @type {Map<string, {preamble: string, entries: Array<{raw: string, parameter: string, index: number}>}>} */
        const groups = new Map();
        /** @type {TeqFw_Cli_Env_Sorter_Token[]} */
        let pending = [];
        let ordinal = 0;

        for (const token of tokens) {
            if (token.kind !== 'assignment') {
                pending.push(token);
                continue;
            }
            const key = /** @type {string} */ (token.key);
            const match = CFG_KEY.exec(key);
            const comments = pending.filter((item) => item.kind === 'comment').map((item) => item.raw).join('');
            if (!match) {
                nonCfg.push({raw: pending.map((item) => item.raw).join('') + token.raw, index: ordinal++});
                pending = [];
                continue;
            }
            pending = [];
            const [, namespace, parameter] = match;
            let group = groups.get(namespace);
            if (!group) {
                group = {preamble: comments, entries: []};
                groups.set(namespace, group);
            }
            group.entries.push({raw: (group.entries.length === 0 ? '' : comments) + token.raw, parameter, index: ordinal++});
        }
        if (groups.size === 0) return source;

        /** @param {string} raw @returns {string} */
        const render = (raw) => withoutFinalNewline(raw);
        const sections = [];
        if (nonCfg.length > 0) sections.push(nonCfg.map((item) => render(item.raw)).join(eol));
        for (const namespace of [...groups.keys()].sort()) {
            const group = /** @type {{preamble: string, entries: Array<{raw: string, parameter: string, index: number}>}} */ (groups.get(namespace));
            const entries = [...group.entries].sort((left, right) => (left.parameter < right.parameter ? -1 : (left.parameter > right.parameter ? 1 : left.index - right.index)));
            sections.push([group.preamble ? render(group.preamble) : '', ...entries.map((item) => render(item.raw))].filter(Boolean).join(eol));
        }
        let result = sections.join(eol + eol);
        const trailing = pending.map((item) => item.raw).join('');
        if (trailing) result += (result ? eol : '') + withoutFinalNewline(trailing);
            return bom + result + (hasFinalNewline ? eol : '');
        };
    }
}
