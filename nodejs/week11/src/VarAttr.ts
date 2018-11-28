import { VarKind } from "./Enum";

export default class VarAttr {
    readonly type: string;
    readonly kind: VarKind;
    readonly index: number;

    constructor(type: string, kind: VarKind, index: number) {
        this.type = type;
        this.kind = kind;
        this.index = index;
    }
}
