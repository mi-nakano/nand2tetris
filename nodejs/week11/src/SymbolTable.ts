import { VarKind } from './Enum';
import VarAttr from './VarAttr';

export default class SymbolTable {
    private classTable: Record<string, VarAttr> = {};
    private subroutineTable: Record<string, VarAttr> = {};
    private staticIndex: number = 0;;
    private fieldIndex: number = 0;;
    private argIndex: number = 0;
    private varIndex: number = 0;

    public startSubroutine(): void {
        this.subroutineTable = {};
        this.argIndex = 0;
        this.varIndex = 0;
    }

    public define(name: string, type: string, kind: VarKind): void {
        if (kind === VarKind.STATIC) {
            this.classTable[name] = new VarAttr(type, kind, this.staticIndex++);
        } else if (kind === VarKind.FIELD) {
            this.classTable[name] = new VarAttr(type, kind, this.fieldIndex++);
        } else if (kind === VarKind.ARG) {
            this.subroutineTable[name] = new VarAttr(type, kind, this.argIndex++);
        } else if (kind === VarKind.VAR) {
            this.subroutineTable[name] = new VarAttr(type, kind, this.varIndex++);
        } else {
            throw new Error(`Unexpected kind: ${kind}`);
        }
    }

    public varCount(kind: VarKind): number {
        if (kind === VarKind.STATIC) {
            return this.staticIndex;
        } else if (kind === VarKind.FIELD) {
            return this.fieldIndex;
        } else if (kind === VarKind.ARG) {
            return this.argIndex;
        } else if (kind === VarKind.VAR) {
            return this.varIndex;
        } else {
            throw new Error(`Unexpected kind: ${kind}`);
        }
    }

    public kindOf(name: string): VarKind {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].kind;
        }
        if (this.classTable[name]) {
            return this.classTable[name].kind;
        }
        return VarKind.NONE;
    }

    public typeOf(name: string): string {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].type;
        }
        if (this.classTable[name]) {
            return this.classTable[name].type;
        }
        throw new Error(`Undefined var: ${name}`);
    }

    public indexOf(name: string): number {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].index;
        }
        if (this.classTable[name]) {
            return this.classTable[name].index;
        }
        throw new Error(`Undefined var: ${name}`);
    }
}
