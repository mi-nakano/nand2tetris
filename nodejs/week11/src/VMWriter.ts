import { Segment, Command } from './Enum';
const fs = require('fs');

export default class VMWriter {
    private fileName: string;
    constructor(fileName: string) {
        this.fileName = fileName;
    }

    public writePush(segment: Segment, index: number): void {
        this.write(`push ${segment} ${index}`);
    }

    public writePop(segment: Segment, index: number): void {
        this.write(`pop ${segment} ${index}`);
    }

    public writeArithmetic(command: Command): void {
        this.write(`${command}`);
    }

    public writeLabel(label: string): void {
        this.write(`label ${label}`);
    }

    public writeGoTo(label: string): void {
        this.write(`goto ${label}`);
    }

    public writeIf(label: string): void {
        this.write(`if-goto ${label}`);
    }

    public writeCall(name: string, nArgs: number): void {
        this.write(`call ${name} ${nArgs}`);
    }

    public writeFunction(name: string, nLocal: number): void {
        this.write(`function ${name} ${nLocal}`);
    }

    public writeReturn(): void {
        this.write('return');
    }

    private write(str: string): void {
        fs.appendFileSync(this.fileName, str + '\n');
    }

}
