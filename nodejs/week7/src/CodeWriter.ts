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

    public writeArithmetic(_command: string): void {
        console.log(`writeArithmetic(${_command})`);
        this.writePop('local', 0);
        this.writePop('local', 1);

        let output = '';
        // D = local0 + local1
        output += '@LCL' + '\n';
        output += 'A=M+1' + '\n';
        output += 'D=M' + '\n';
        output += '@LCL' + '\n';
        output += 'A=M' + '\n';
        output += 'D=D+M' + '\n';

        // local 0 <- Result
        output += '@LCL' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';
        this.write(output);

        this.writePush('local', 0);
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
        console.log(`writePush(${segment}, ${index})`);
        let output = '';
        if (segment === 'constant') {
            output += `@${index}` + '\n';
            output += 'D=A' + '\n';
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
        console.log(`writePop(${segment}, ${index})`);
        let output = '';
        // R5 = segment Addr
        output += `@${segmentMap[segment]}` + '\n';
        output += 'D=M' + '\n';
        output += `@${index}` + '\n';
        output += 'D=D+A' + '\n';
        output += '@R5' + '\n';
        output += 'M=D' + '\n';

        // D = SP--
        output += '@SP' + '\n';
        output += 'M=M-1' + '\n';
        output += 'A=M' + '\n';
        output += 'D=M' + '\n';

        output += '@R5' + '\n';
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
