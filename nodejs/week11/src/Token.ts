import { TokenType } from "./Enum";

export default class Token {
    readonly type: TokenType;
    readonly value: string;

    constructor(type: TokenType, value: string) {
        this.type = type;
        this.value = value;
    }
}
