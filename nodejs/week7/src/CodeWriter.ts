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
    private labelIndex: number;

    constructor() {
        this.labelIndex = 0;
    }

    public setFileName(fileName: string): void {
        this.fileName = fileName;
        fs.writeFileSync(fileName, '');
    }

    public writeArithmetic(command: string): void {
        //console.log(`writeArithmetic(${command})`);
        if (command === 'add') {
            this.writeBinaryOp('+');
        } else if (command === 'sub') {
            this.writeBinaryOp('-');
        } else if (command === 'and') {
            this.writeBinaryOp('&');
        } else if (command === 'or') {
            this.writeBinaryOp('|');
        } else if (command === 'not') {
            this.writeUnaryOp('!');
        } else if (command === 'neg') {
            this.writeUnaryOp('-');
        } else if (command === 'eq') {
            this.writeJump('JEQ');
        } else if (command === 'lt') {
            this.writeJump('JLT');
        } else if (command === 'gt') {
            this.writeJump('JGT');
        }
    }

    private writePushD() {
        let output = '';

        // SP = D
        output += '@SP' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';

        // increment SP
        output += '@SP' + '\n';
        output += 'M=M+1' + '\n';

        this.write(output);
    }

    private writeBinaryOp(op: string): void {
        this.writePop('temp', 1);
        this.writePop('temp', 0);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += `D=D${op}M` + '\n';
        this.write(output);

        this.writePushD();
    }

    private writeUnaryOp(op: string): void {
        this.writePop('temp', 0);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += `D=${op}M` + '\n';
        this.write(output);

        this.writePushD();
    }

    private writeJump(jumpOp: string): void {
        const index = this.labelIndex++;

        this.writePop('temp', 1);
        this.writePop('temp', 0);

        let output = '';
        output += '@5' + '\n';  // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n';  // temp 1
        output += 'D=D-M' + '\n';
        output += `@Jumptrue${index}` + '\n';
        output += `D;${jumpOp}` + '\n'; // jump to label

        // prediction is false
        output += 'D=0' + '\n';
        output += `@Jumpend${index}` + '\n';
        output += '0;JMP' + '\n';

        // prediction is true
        output += `(Jumptrue${index})` + '\n';
        output += 'D=-1' + '\n';

        output += `(Jumpend${index})` + '\n';
        this.write(output);

        this.writePushD();
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
        this.write(output);

        this.writePushD();
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
