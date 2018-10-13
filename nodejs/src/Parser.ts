import Code from './Code';
import SymbolTable from './SymbolTable';
import fs = require('fs');

export enum CommandType {
    A_COMMAND,
    C_COMMAND,
    L_COMMAND,
    NULL,
}

export class Parser {
    private symbolTable: SymbolTable;
    private lines: string[];
    private current: string;
    private currentRam: number;

    constructor(fileName: string) {
        this.symbolTable = new SymbolTable();
        this.lines = fs.readFileSync(fileName, 'utf-8')
            .split('\n')
            .map((value) => {
                return value
                    .replace(/\/\/.*/, '')
                    .replace(/^\s*/, '')
                    .replace(/\s*$/, '');
            });
        this.throughSkippable();
        this.setCurrent();
        this.currentRam = 16;
    }

    private setCurrent() {
        this.current = this.lines[0].replace(/\n|\r/g, "");
    }

    private throughSkippable(): void {
        while (this.lines.length > 0 && Parser.isSkippable(this.lines[0])) {
            this.lines.shift();
        }
    }

    public static isSkippable(line: string): boolean {
        if (line.startsWith('//')) {
            return true;
        }
        if (line.match(/^\s*$/)) {
            return true;
        }
        return false;
    }

    public static checkCommandType(line: string): CommandType {
        if (line.startsWith('@')) {
            return CommandType.A_COMMAND;
        }
        if (line.startsWith('(') && line.endsWith(')')) {
            return CommandType.L_COMMAND;
        }
        return CommandType.C_COMMAND;
    }

    public hasMoreCommands(): boolean {
        return this.lines.length !== 0;
    }

    public advance(): void {
        this.throughSkippable();
        this.lines.shift();
        this.setCurrent();
        this.throughSkippable();
    }

    public preEval(): void {
        let currentRomNo = 0;
        for (const line of this.lines) {
            const type = Parser.checkCommandType(line);
            if (type === CommandType.A_COMMAND || type === CommandType.C_COMMAND) {
                currentRomNo++;
            }
            if (type === CommandType.L_COMMAND) {
                const symbol = line.replace('(', '').replace(')', '');
                this.symbolTable.addEntry(symbol, currentRomNo);
            }
        }
    }

    public eval(): string {
        switch (this.commandType()) {
            case CommandType.A_COMMAND:
                return this.evalACommand(this.current);
            case CommandType.C_COMMAND:
                return Parser.evalCCommand(this.current);
            case CommandType.L_COMMAND:
                return '';
        }
        return '';
    }

    public evalACommand(command: string): string {
        // remove @
        const value = command.split('@')[1];
        const first = value.charAt(0);
        if ('0' <= first && first <= '9') { // only number
            return Parser.convertDecimal2Binary(value);
        }
        if (!this.symbolTable.contains(value)) {
            this.symbolTable.addEntry(value, this.currentRam);
            this.currentRam++;
        }
        const address = this.symbolTable.getAddress(value);
        return Parser.convertDecimal2Binary(address.toString());
    }

    public static convertDecimal2Binary(decimalStr: string): string {
        const positivePadding = '0000000000000000';
        const negativePadding = '1111111111111111';

        const decimalNum = Number(decimalStr);
        const binStr = (decimalNum >>> 0).toString(2);
        const padding = (decimalNum >= 0) ? positivePadding : negativePadding;
        return (padding + binStr).slice(-16);
    }

    public static evalCCommand(command: string): string {
        const com = Parser.splitCommand(command);
        return '111' + Parser.comp(com.comp) + Parser.dest(com.dest) + Parser.jump(com.jump);
    }

    public static splitCommand(command: string) {
        let matches = command.match(/^(?:(.*)=){0,1}([^;]*)(?:;(.*)){0,1}$/);
        matches = matches || [];
        return {
            dest: matches[1] || 'null',
            comp: matches[2] || '',
            jump: matches[3] || 'null',
        };
    }

    public commandType(): CommandType {
        return Parser.checkCommandType(this.current);
    }

    public symbol(symbol: string): string {
        const address = this.symbolTable.getAddress(symbol);
        return Parser.convertDecimal2Binary(address.toString());
    }

    public static dest(mnemonic: string): string {
        return Code.dest(mnemonic);
    }

    public static comp(mnemonic: string): string {
        return Code.comp(mnemonic);
    }

    public static jump(mnemonic: string): string {
        return Code.jump(mnemonic);
    }
}
