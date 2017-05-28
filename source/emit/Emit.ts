
export class Emit {

    private static emitInstance: Emit = new Emit();
    private emit = false;

    public static getInstance(): Emit {
        return Emit.emitInstance;
    }

    public setEmit(emit: boolean): void {
        this.emit = emit;
    }

    public getEmit(): boolean {
        return this.emit;
    }

    constructor() {
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
}
