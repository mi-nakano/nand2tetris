import JackTokenizer from './JackTokenizer';
import CompilationEngine from './CompilationEngine';

const fs = require('fs');

if (process.argv.length !== 3) {
    throw new Error('Unexpected args');
}

const path = process.argv[2];
if (path.endsWith('.jack')) { // only 1 jack file
    compileFile(path, path.replace('.jack', '.vm'));
} else {    // directory
    for (const fileName of fs.readdirSync(path)) {
        if (fileName.endsWith('.jack')) {
            compileFile(`${path}/${fileName}`, `${path}/${fileName.replace('jack', 'vm')}`);
        }
    }
}

function compileFile(inputPath: string, outputPath: string) {
    const tokenizer = new JackTokenizer(inputPath);
    fs.writeFileSync(outputPath, '');
    const engine = new CompilationEngine(tokenizer, outputPath);
    engine.compileClass();
}
