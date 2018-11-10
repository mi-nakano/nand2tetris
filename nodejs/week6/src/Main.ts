import { Parser } from "./Parser";

const fileName = process.argv[2];

let output = '';
const parser = new Parser(fileName);
parser.preEval();
while (parser.hasMoreCommands()) {
    const lineOutput = parser.eval();
    if (lineOutput !== '') {
        output += lineOutput + '\n';
    }
    parser.advance();
}
// remove last \n
output = output.substring(0, output.length - 1);

console.log(output);
