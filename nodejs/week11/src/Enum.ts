enum TokenType {
    KEYWORD,
    SYMBOL,
    IDENTIFIER,
    INT_CONST,
    STRING_CONST,
}

enum VarKind {
    STATIC,
    FIELD,
    ARG,
    VAR,
    NONE,
}

type Segment =
    'constant' |
    'argument' |
    'local' |
    'static' |
    'this' |
    'that' |
    'pointer' |
    'temp';

type Command =
    'add' |
    'sub' |
    'neg' |
    'eq' |
    'gt' |
    'lt' |
    'and' |
    'or' |
    'not';

export { TokenType, VarKind, Segment, Command };
