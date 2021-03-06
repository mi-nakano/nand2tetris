import { TokenType } from './Enum';
import Token from './Token';
const fs = require('fs');

const keyWords: string[] = [
    'class',
    'constructor',
    'function',
    'method',
    'field',
    'static',
    'var',
    'int',
    'char',
    'boolean',
    'void',
    'true',
    'false',
    'null',
    'this',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return',
];
const symbols = [
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '.',
    ',',
    ';',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
    '~',
];

export default class JackTokenizer {
    private tokens: Token[];

    constructor(fileName: string) {
        let fileData: string = fs.readFileSync(`${fileName}`).toString();
        fileData = JackTokenizer.trim(fileData);
        this.tokens = JackTokenizer.readTokens(fileData);
    }

    private static trim(str: string): string {
        // remove comment
        str = str.replace(/\/\/.*?[\n|\r|\n\r]/g, '');
        str = str.replace(/\/\*[\s\S]*?\*\//g, '');

        str = str.replace(/\s{2,}/g, ' ');
        str = str.replace(/^\s/g, '');
        str = str.replace(/\s$/g, '');
        return str;
    }

    private static readTokens(text: string): Token[] {
        const tokens: Token[] = [];
        while (text.length > 0) {
            const first = text.substring(0, 1);
            text = text.substring(1);

            if (first === '\n' || first === ' ') {
                continue;
            }
            if (JackTokenizer.isSymbol(first)) {
                tokens.push(new Token(TokenType.SYMBOL, first));
                continue;
            }
            if (first === '"') {    // start STRING_CONST
                let chunk = '';
                let current = text.substr(0, 1);
                while (text.length > 0
                    && current !== '"') {
                    chunk += current;
                    text = text.substring(1);
                    current = text.substr(0, 1);
                }
                text = text.substring(1);   // remove "
                tokens.push(new Token(TokenType.STRING_CONST, chunk));
                continue;
            }

            // else read more
            let chunk = first;
            let peek = text.substr(0, 1);
            while (text.length > 0
                && !JackTokenizer.isSymbol(peek)
                && peek !== '\n'
                && peek !== ' ') {
                chunk += peek;
                text = text.substring(1);
                peek = text.substr(0, 1);
            }
            if (JackTokenizer.isNumber(chunk)) {
                tokens.push(new Token(TokenType.INT_CONST, chunk));
            } else if (JackTokenizer.isKeyword(chunk)) {
                tokens.push(new Token(TokenType.KEYWORD, chunk));
            } else {
                tokens.push(new Token(TokenType.IDENTIFIER, chunk));
            }
            continue;
        }
        return tokens;
    }

    private static isNumber(str: string) {
        return !Number.isNaN(Number(str));
    }

    private static isKeyword(str: string): boolean {
        if (keyWords.includes(str)) {
            return true;
        }
        return false;
    }

    private static isSymbol(str: string): boolean {
        if (symbols.includes(str)) {
            return true;
        }
        return false;
    }

    public printTokens(): void {
        for (const token of this.tokens) {
            console.log(`${token.type}: ${token.value}`);
        }
    }

    public hasMoreTokens(): boolean {
        if (this.tokens.length === 0) {
            return false;
        }
        return true;
    }

    public advance(): void {
        this.tokens.shift();
    }

    public peek(index: number): string {
        return this.tokens[index].value;
    }

    public tokenType(): TokenType {
        return this.tokens[0].type;
    }

    public keyWord(): string {
        const token = this.tokens[0];
        if (token.type !== TokenType.KEYWORD) {
            throw new Error(`This token is not KEYWORD: ${token.value}`);
        }
        return token.value;
    }

    public symbol() {
        const token = this.tokens[0];
        if (token.type !== TokenType.SYMBOL) {
            throw new Error(`This token is not SYMBOL: ${token.value}`);
        }
        return token.value;
    }

    public identifier(): string {
        const token = this.tokens[0];
        if (token.type !== TokenType.IDENTIFIER) {
            throw new Error(`This token is not IDENTIFIER: ${token.value}`);
        }
        return token.value;
    }

    public intVal(): number {
        const token = this.tokens[0];
        if (token.type !== TokenType.INT_CONST) {
            throw new Error(`This token is not INT_CONST: ${token.value}`);
        }
        return Number(token.value);
    }

    public stringVal(): string {
        const token = this.tokens[0];
        if (token.type !== TokenType.STRING_CONST) {
            throw new Error(`This token is not STRING_CONST: ${token.value}`);
        }
        return token.value;
    }
}
