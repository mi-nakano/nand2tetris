import Parser from './Parser';
import CodeWriter from './CodeWriter';
import { CommandType } from './Enum';

if (process.argv.length !== 3) {
    throw new Error();
}

const fileName = process.argv[2];   // fileName.vm
const parser = new Parser(`${fileName}`);
const codeWriter = new CodeWriter();
codeWriter.setFileName(`${fileName.replace('.vm', '')}.asm`);

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
