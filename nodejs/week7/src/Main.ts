import Parser from './Parser';
import CodeWriter from './CodeWriter';
import { CommandType } from './Enum';

if (process.argv.length !== 3) {
    throw new Error();
}

const fileName = process.argv[2];
const parser = new Parser(`${fileName}.vm`);
const codeWriter = new CodeWriter();
codeWriter.setFileName(`${fileName}.asm`);

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
    }
}
