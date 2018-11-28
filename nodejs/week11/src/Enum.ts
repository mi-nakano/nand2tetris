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

export { TokenType, VarKind };
