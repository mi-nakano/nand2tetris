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
    private className: string;
    private labelIndex: number;

    constructor(outputFileName: string) {
        this.labelIndex = 0;
        this.fileName = outputFileName;
        fs.writeFileSync(outputFileName, '');
    }

    public setFileName(fileName: string): void {
        this.className = fileName.replace(/^.*\//, '');
    }

    public writeInit(): void {
        this.writeSetSymbol('SP', 256);
        this.writeSetSymbol('LCL', 256);
        this.writeSetSymbol('ARG', 1000);
        this.writeSetSymbol('THIS', 3000);
        this.writeSetSymbol('THAT', 4000);
        this.writeCall('Sys.init', 0);
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
        } else {
            throw new Error(`${command} is not Arithmetic!`);
        }
    }

    public writeLabel(labelName: string): void {
        this.write(`(${labelName})\n`);
    }

    public writeGoto(labelName: string): void {
        let output = '';
        output += `@${labelName}\n`;
        output += '0;JMP\n';
        this.write(output);
    }

    public writeIf(labelName: string): void {
        const index = this.labelIndex++;
        this.writePop('register', 0);

        let output = '';
        output += '@13' + '\n';  // register 0
        output += 'D=M' + '\n';
        output += `@Ifend${index}\n`;
        output += 'D;JEQ\n';

        output += `@${labelName}\n`; // jump
        output += '0;JMP\n';

        output += `(Ifend${index})\n`; // donot jump
        this.write(output);
    }

    public writeCall(functionName: string, numArgs: number): void {
        const index = this.labelIndex++;
        let output: string = '';

        // push retur-address
        output += `@return${index}\n`;
        output += 'D=A\n';
        this.write(output);
        this.writePushD();

        // save frame addresses
        this.writePushSymbolValue('LCL');
        this.writePushSymbolValue('ARG');
        this.writePushSymbolValue('THIS');
        this.writePushSymbolValue('THAT');

        // ARG = SP - ${numArgs} - 5
        output = '';
        output += '@SP\n';
        output += 'D=A\n';
        output += `@${numArgs + 5}\n`;
        output += 'D=D-A\n';
        this.write(output);
        this.writeSetSymbolAddr('ARG');

        // LCL = SP
        output = '';
        output += '@SP\n';
        output += 'A=M\n';
        output += 'D=M\n';
        this.write(output);
        this.writeSetSymbolAddr('LCL');

        this.writeGoto(functionName);

        this.write(`(return${index})\n`);

    }

    public writeReturn(): void {
        // FRAME: @R14, RET: @R15
        // FRAME = LCL
        let output = '';
        output += '@LCL\n';
        output += 'D=M\n';
        output += '@R14\n';
        output += 'M=D\n';
        this.write(output);

        // RET = * (FRAME - 5)
        output = '';
        output += '@R14\n';
        output += 'D=M\n';
        output += '@5\n';
        output += 'A=D-A\n';
        output += 'D=M\n';
        output += '@R15\n';
        output += 'M=D\n';
        this.write(output);

        // * ARG = pop()
        this.writePop('register', 0);
        output = '';
        output += '@13\n';  // register 0
        output += 'D=M\n';
        output += '@ARG\n';
        output += 'A=M\n';
        output += 'M=D\n';
        this.write(output);

        // SP = ARG+1
        output = ''
        output += '@ARG\n';
        output += 'D=M+1\n';
        output += '@SP\n';
        output += 'M=D\n';
        this.write(output);

        // THAT = *(FRAME - 1). THIS = *(FRAME - 2). ARG = *(FRAME - 3). LCL = *(FRAME - 4)
        this.writeSetFrame('THAT', 1);
        this.writeSetFrame('THIS', 2);
        this.writeSetFrame('ARG', 3);
        this.writeSetFrame('LCL', 4);

        // goto RET
        output = ''
        output += '@R15\n';
        output += 'A=M\n';
        output += '0;JMP\n';
        this.write(output);
    }

    public writeFunction(functionName: string, numArgs: number): void {
        this.write(`(${functionName})\n`);

        for (let i = 0; i < numArgs; i++) {
            this.writePush('constant', 0);
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

    private writePushSymbolValue(symbolName: string) {
        let output = '';
        output += `@${symbolName}\n`;
        output += 'D=M' + '\n';
        this.write(output);

        this.writePushD();
    }

    // ex) SP = 256
    private writeSetSymbol(symbolName: string, constant: number) {
        let output = '';
        output += `@${constant}\n`;
        output += 'D=A' + '\n';
        output += `@${symbolName}\n`;
        output += 'M=D' + '\n';
        this.write(output);
    }

    // ex) * SP = D
    private writeSetSymbolAddr(symbolName: string) {
        let output = '';
        output += `@${symbolName}\n`;
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';
        this.write(output);
    }

    // FRAME: @R14
    // ex) THAT = *(FRAME - 1)
    private writeSetFrame(symbolName: string, offset: number) {
        let output = '';
        output += '@R14\n'
        output += 'D=M' + '\n';
        output += `@${offset}\n`
        output += 'A=D-A\n';
        output += 'D=M' + '\n';
        output += `@${symbolName}\n`;
        output += 'M=D' + '\n';
        this.write(output);
    }

    private writeBinaryOp(op: string): void {
        this.writePop('register', 1);
        this.writePop('register', 0);

        let output = '';
        output += '@13' + '\n';  // register 0
        output += 'D=M' + '\n';
        output += '@14' + '\n';  // register 1
        output += `D=D${op}M` + '\n';
        this.write(output);

        this.writePushD();
    }

    private writeUnaryOp(op: string): void {
        this.writePop('register', 0);

        let output = '';
        output += '@13' + '\n';  // register 0
        output += `D=${op}M` + '\n';
        this.write(output);

        this.writePushD();
    }

    private writeJump(jumpOp: string): void {
        const index = this.labelIndex++;

        this.writePop('register', 1);
        this.writePop('register', 0);

        let output = '';
        output += '@13' + '\n';  // register 0
        output += 'D=M' + '\n';
        output += '@14' + '\n';  // register 1
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
        } else if (segment === 'static') {
            output += `@${this.className}.${index}` + '\n';
            output += 'D=M' + '\n';
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
        } else if (segment === 'static') {
            output += `@${this.className}.${index}` + '\n';
            output += 'D=A' + '\n';
        } else if (segment === 'register') {
            output += `@${13 + index}` + '\n';
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
