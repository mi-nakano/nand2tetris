import Parser from '../src/Parser';

describe('Parser', () => {
    it.each([
        ['   test', 'test'],
        ['test    ', 'test'],
        ['test a b', 'test a b'],
        [' test  a  b', 'test a b'],
        [' test  a  b    ', 'test a b'],
        [' test  abcde   fgh   ', 'test abcde fgh'],
        ['   ', ''],
        ['//   ', ''],
        ['  //   ', ''],
    ])('shape', (input, output) => {
        expect(Parser.shape(input)).toEqual(output);
    });

});
