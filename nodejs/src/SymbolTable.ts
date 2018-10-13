export default class SymbolTable {
    private table: { [index: string]: number };
    public constructor() {
        this.table = {};
        this.addEntry('SP', 0);
        this.addEntry('LCL', 1);
        this.addEntry('ARG', 2);
        this.addEntry('THIS', 3);
        this.addEntry('THAT', 4);
        this.addEntry('R0', 0);
        this.addEntry('R1', 1);
        this.addEntry('R2', 2);
        this.addEntry('R3', 3);
        this.addEntry('R4', 4);
        this.addEntry('R5', 5);
        this.addEntry('R6', 6);
        this.addEntry('R7', 7);
        this.addEntry('R8', 8);
        this.addEntry('R9', 9);
        this.addEntry('R10', 10);
        this.addEntry('R11', 11);
        this.addEntry('R12', 12);
        this.addEntry('R13', 13);
        this.addEntry('R14', 14);
        this.addEntry('R15', 15);
        this.addEntry('SCREEN', 16384);
        this.addEntry('KBD', 24576);
    }

    public addEntry(symbol: string, address: number): void {
        this.table[symbol] = address;
    }

    public contains(symbol: string): boolean {
        return this.table.hasOwnProperty(symbol);
    }

    public getAddress(symbol: string): number {
        return this.table[symbol];
    }
}
