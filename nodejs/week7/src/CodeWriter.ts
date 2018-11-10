import { CommandType } from './Enum';
const fs = require('fs');

const segmentMap: Record<string, string> = {
    argument: 'ARG',
    local: 'LCL',
    this: 'THIS',
    that: 'THAT',
}

export default class CodeWriter {
    private fileName: string;

    constructor() {
    }

    public setFileName(fileName: string): void {
        this.fileName = fileName;
        fs.writeFileSync(fileName, '');
    }

    public writeArithmetic(command: string): void {
        //console.log(`writeArithmetic(${command})`);

        if (command === 'add') {
            this.writeAdd();
        } else if (command === 'sub') {
            this.writeSub();
        } else if (command === 'and') {
            this.writeAnd();
        } else if (command === 'or') {
            this.writeOr();
        } else if (command === 'not') {
            this.writeNot();
        } else if (command === 'neg') {
            this.writeNeg();
        } else if (command === 'eq') {
            this.writeEq();
        } else if (command === 'lt') {
            this.writeLt();
        } else if (command === 'gt') {
            this.writeGt();
        }

        // temp 0 <- D
        let output = '';
        output += '@5' + '\n';
        output += 'M=D' + '\n';
        this.write(output);

        this.writePush('temp', 0);
    }

    private writeAdd(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += 'D=D+M' + '\n';
        this.write(output);
    }

    private writeSub(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += 'D=D-M' + '\n';
        this.write(output);
    }

    private writeAnd(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += 'D=D&M' + '\n';
        this.write(output);
    }

    private writeOr(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += 'D=D|M' + '\n';
        this.write(output);
    }

    private writeNot(): void {
        this.writePop('temp', 0);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=!M' + '\n';
        this.write(output);
    }

    private writeNeg(): void {
        this.writePop('temp', 0);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=-M' + '\n';
        this.write(output);
    }

    private writeEq(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        this.write(output);
    }

    private writeGt(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        this.write(output);
    }
    private writeLt(): void {
        this.writePop('temp', 0);
        this.writePop('temp', 1);

        let output = '';
        this.write(output);
    }


    public writePushPop(type: CommandType, segment: string, index: number): void {
        if (type === CommandType.C_PUSH) {
            this.writePush(segment, index);
        } else if (type === CommandType.C_POP) {
            this.writePop(segment, index);
        } else {
            throw new Error();
        }
    }

    private writePush(segment: string, index: number) {
        //console.log(`writePush(${segment}, ${index})`);
        let output = '';
        if (segment === 'constant') {
            output += `@${index}` + '\n';
            output += 'D=A' + '\n';
        } else if (segment === 'pointer') {
            output += `@${3 + index}` + '\n'; output += 'D=M' + '\n';
        } else if (segment === 'temp') {
            output += `@${5 + index}` + '\n'; output += 'D=M' + '\n';
        } else {
            output += `@${segmentMap[segment]}` + '\n';
            output += 'D=M' + '\n';
            output += `@${index}` + '\n';
            output += 'D=D+A' + '\n';
            output += 'A=D' + '\n';
            output += 'D=M' + '\n';
        }

        // SP = D
        output += '@SP' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';

        // increment SP
        output += '@SP' + '\n';
        output += 'M=M+1' + '\n';
        this.write(output);
    }

    private writePop(segment: string, index: number) {
        //console.log(`writePop(${segment}, ${index})`);
        let output = '';

        // R13 = segment Addr
        if (segment === 'pointer') {
            output += `@${3 + index}` + '\n';
            output += 'D=A' + '\n';
        } else if (segment === 'temp') {
            output += `@${5 + index}` + '\n';
            output += 'D=A' + '\n';
        } else {
            output += `@${segmentMap[segment]}` + '\n';
            output += 'D=M' + '\n';
            output += `@${index}` + '\n';
            output += 'D=D+A' + '\n';
        }
        output += '@R13' + '\n';
        output += 'M=D' + '\n';

        // D = SP--
        output += '@SP' + '\n';
        output += 'M=M-1' + '\n';
        output += 'A=M' + '\n';
        output += 'D=M' + '\n';

        output += '@R13' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';

        this.write(output);
    }

    private write(text: string): void {
        fs.appendFileSync(this.fileName, text);
    }

    public close(): void {
    }
}
