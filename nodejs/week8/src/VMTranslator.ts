import Parser from './Parser';
import CodeWriter from './CodeWriter';
import { CommandType } from './Enum';
const fs = require('fs');

if (process.argv.length !== 3) {
    throw new Error();
}

const path = process.argv[2];   // fileName.vm or directory
const vmFiles: string[] = [];
let asmFileName;

if (path.endsWith('.vm')) { // only 1 vm file
    vmFiles.push(path)
    asmFileName = path.replace('.vm', '') + '.asm';
} else {    // all .vm files in directory
    const dirName = path.replace(/.*\//, '');
    asmFileName = `${path}/${dirName}.asm`;
    for (const fileName of fs.readdirSync(path)) {
        if (fileName.endsWith('.vm')) {
            vmFiles.push(`${path}/${fileName}`);
        }
    }
}

const codeWriter = new CodeWriter(asmFileName);
codeWriter.writeInit();
for (let vmFile of vmFiles) {
    codeWriter.setFileName(vmFile);
    const parser = new Parser(`${vmFile}`);
    translateVM(parser, codeWriter);
}

function translateVM(parser: Parser, codeWriter: CodeWriter) {
    while (parser.hasMoreCommands()) {
        parser.advance();
        switch (parser.commandType()) {
            case CommandType.C_ARITHMETIC:
                codeWriter.writeArithmetic(parser.arg1());
                break;
            case CommandType.C_PUSH:
                codeWriter.writePushPop(CommandType.C_PUSH, parser.arg1(), parser.arg2());
                break;
            case CommandType.C_POP:
                codeWriter.writePushPop(CommandType.C_POP, parser.arg1(), parser.arg2());
                break;
            case CommandType.C_LABEL:
                codeWriter.writeLabel(parser.arg1());
                break;
            case CommandType.C_GOTO:
                codeWriter.writeGoto(parser.arg1());
                break;
            case CommandType.C_IF:
                codeWriter.writeIf(parser.arg1());
                break;
            case CommandType.C_CALL:
                codeWriter.writeCall(parser.arg1(), parser.arg2());
                break;
            case CommandType.C_RETURN:
                codeWriter.writeReturn();
                break;
            case CommandType.C_FUNCTION:
                codeWriter.writeFunction(parser.arg1(), parser.arg2());
                break;
            default:
                throw new Error('unknown CommandType');
        }
    }
}
