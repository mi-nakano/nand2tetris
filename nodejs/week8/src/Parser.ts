import { CommandType } from "./Enum";
const fs = require('fs');

export default class Parser {
    private lines: string[];
    private line: string;

    constructor(fileName: string) {
        const fileData = fs.readFileSync(`${fileName}`).toString();
        const tmpLines = fileData.split('\n');
        this.line = '';
        this.lines = [];
        let index = 0;
        for (const tmpLine of tmpLines) {
            const shapedLine = Parser.shape(tmpLine);
            if (shapedLine === '') { // object == string
                continue;
            }
            this.lines[index++] = shapedLine;
        }
    }

    public static shape(str: string): string {
        str = str.replace(/^\s+/, '');
        str = str.replace(/\s+$/, '');
        str = str.replace(/\s{2,}/g, ' ');
        if (str.startsWith('//')) {
            return '';
        }
        return str;
    }

    public hasMoreCommands(): boolean {
        if (this.lines && this.lines.length > 0) {
            return true;
        }
        return false;
    }

    public advance(): void {
        const first = this.lines.shift();
        this.line = (first) ? first : '';
    }

    public commandType(): CommandType {
        const commandMap: Record<string, CommandType> = {
            'pop': CommandType.C_POP,
            'push': CommandType.C_PUSH,
            'goto': CommandType.C_GOTO,
            'if-goto': CommandType.C_IF,
            'function': CommandType.C_FUNCTION,
            'return': CommandType.C_RETURN,
            'call': CommandType.C_CALL,
            '(': CommandType.C_LABEL,
        }

        for (const key in commandMap) {
            if (this.line.startsWith(key)) {
                return commandMap[key];
            }
        }

        return CommandType.C_ARITHMETIC;
    }

    public arg1(): string {
        if (this.commandType() === CommandType.C_ARITHMETIC) {
            return this.line;
        }
        return this.line.split(' ')[1];
    }

    public arg2(): number {
        return Number(this.line.split(' ')[2]);
    }
}
