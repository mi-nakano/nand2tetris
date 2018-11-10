import { Parser, CommandType } from '../src/Parser';

describe('Parser', () => {
    describe('isSkippable', () => {
        it.each([
            ['// test'],
            ['//test'],
            [''],
            [' '],
            ['     '],
        ])('should return true', (line: string) => {
            expect(Parser.isSkippable(line)).toBe(true);
        });
    });

    describe('checkCommandType', () => {
        it.each([
            ['@hoge', CommandType.A_COMMAND],
            ['M=D', CommandType.C_COMMAND],
            ['M=D;JMP', CommandType.C_COMMAND],
            ['(xxx)', CommandType.L_COMMAND],
            ['xxx)', CommandType.C_COMMAND],
            ['(xxx', CommandType.C_COMMAND],
            ['foobar', CommandType.C_COMMAND],
        ])('should return true', (line: string, expected) => {
            expect(Parser.checkCommandType(line)).toBe(expected);
        });
    });

    describe('advance & hasMoreCommands', () => {
        it('', () => {
            const parser = new Parser('./week6/tests/parser.test.data');
            expect(parser.hasMoreCommands()).toBe(true);
            parser.advance();
            expect(parser.hasMoreCommands()).toBe(true);
            parser.advance();
            expect(parser.hasMoreCommands()).toBe(false);
        });
    });

    describe('splitCommand', () => {
        it.each([
            ['D+1', { dest: 'null', comp: 'D+1', jump: 'null' }],
            ['M=D+1', { dest: 'M', comp: 'D+1', jump: 'null' }],
            ['M=D+1;JMP', { dest: 'M', comp: 'D+1', jump: 'JMP' }],
            ['A=D|A;JLT', { dest: 'A', comp: 'D|A', jump: 'JLT' }],
            ['null=D&A;null', { dest: 'null', comp: 'D&A', jump: 'null' }],
            ['0;null', { dest: 'null', comp: '0', jump: 'null' }],
            ['!A;null', { dest: 'null', comp: '!A', jump: 'null' }],
            ['-1', { dest: 'null', comp: '-1', jump: 'null' }],
            ['D+1;JMP', { dest: 'null', comp: 'D+1', jump: 'JMP' }],
        ])('should return true', (command: string, expected) => {
            expect(Parser.splitCommand(command)).toEqual(expected);
        });
    });

    describe('convertDecimal2Binary', () => {
        it.each([
            ['0', '0000000000000000'],
            ['1', '0000000000000001'],
            ['-1', '1111111111111111'],
        ])('should return binary str', (str: string, expected) => {
            expect(Parser.convertDecimal2Binary(str)).toBe(expected);
        });
    });
});
