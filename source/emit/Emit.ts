import {Scheduler} from "../rules/Scheduler";
import {Piece} from "../entities/Piece";
export class Emit {

    private static emitInstance: Emit = new Emit();
    private emit = false;
    private enableSocket = true;
    private scheduler: Scheduler;

    public static getInstance(): Emit {
        return Emit.emitInstance;
    }

    public setEmit(emit: boolean): void {
        this.emit = emit;
    }

    public getEmit(): boolean {
        return this.emit;
    }

    public setEnableSocket(enableSocket: boolean): void {
        this.enableSocket = enableSocket;
    }

    public getEnableSocket(): boolean {
        return this.enableSocket;
    }

    public setScheduler(scheduler: Scheduler): void {
        this.scheduler = scheduler;
    }

    public getPieceByUniqueId(uniqueId: string): Piece {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    }

    constructor() {
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
}
