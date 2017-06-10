import {Scheduler} from "../rules/Scheduler";
import {Piece} from "../entities/Piece";
import {EmitDie} from "../emit/EmitDie";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Emit");
export class Emit {

    private static emitInstance: Emit = new Emit();
    private emit = false;
    private enableSocket = true;
    private scheduler: Scheduler;
    private sessionId: string;
    private currentPlayerId: string;
    private socket: SocketIO.Socket;
    private signal: Phaser.Signal;
    private emitDice: EmitDie = new EmitDie();
    private gameIdText: any;

    public static getInstance(): Emit {
        return Emit.emitInstance;
    }

    public setGameIdText(gameIdText: any): void {
        this.gameIdText = gameIdText;
    }

    // Emitters
    public unselectActiveDie(die: any): void {
        this.emitDice.setParameters(die);
        this.socket.emit("unselectActiveDie", this.emitDice);
    }

    public selectActiveDie(die: any): void {
        this.emitDice.setParameters(die);
        this.socket.emit("selectActiveDie", this.emitDice);
    }

    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public setCurrentPlayerId(currentPlayerId: string): void {
        this.currentPlayerId = currentPlayerId;
    }

    public getCurrentPlayerId(): string {
        return this.currentPlayerId;
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

    // Setters
    public setScheduler(scheduler: Scheduler): void {
        this.scheduler = scheduler;
    }

    public setSocket(socket: SocketIO.Socket): void {
        this.socket = socket;
    }

    public setSignal(signal: Phaser.Signal): void {
        this.signal = signal;
    }


    public getPieceByUniqueId(uniqueId: string): Piece {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    }

    public checkPlayerId(playerId: string): void {
        if (playerId === this.currentPlayerId) {
            this.emit = true;
            this.gameIdText.fill = "#00ffff";
            log.debug("Setting emit to " + this.emit);
        }else {
            this.emit = false;
            this.gameIdText.fill = "#F70C0C";
            log.debug("Setting emit to " + this.emit);
        }
    }

    constructor() {
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
}
