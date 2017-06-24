import {Scheduler} from "../rules/Scheduler";
import {Piece} from "../entities/Piece";
import {EmitDie} from "../emit/EmitDie";
import {factory} from "../logging/ConfigLog4j";
import {PlayerMode} from "../enums/PlayerMode";

const log = factory.getLogger("model.Emit");
declare var Spinner: any;
export class Emit {

    private static emitInstance: Emit = new Emit();
    private emit = false;
    private enableSocket = false;
    private peckAndStay =  false;
    private creator = false;
    private scheduler: Scheduler;
    private sessionId: string;
    private currentPlayerId: string;
    private socket: SocketIO.Socket;
    private signal: Phaser.Signal;
    private emitDice: EmitDie = new EmitDie();
    private gameIdText: any;
    private gameMode: PlayerMode = PlayerMode.Default;
    private opts = {
        lines: 13 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 14 // The line thickness
        , radius: 42 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: "#000" // #rgb or #rrggbb or array of colors
        , opacity: 0.25 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: "spinner" // The CSS class to assign to the spinner
        , top: "50%" // Top position relative to parent
        , left: "39%" // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false, // Whether to use hardware acceleration
    };
    private spinner = new Spinner(this.opts).spin();

    public static getInstance(): Emit {
        return Emit.emitInstance;
    }

    public startSpinner(): void {
        let target = document.getElementById("spin");
        this.spinner.spin(target);
    }

    public stopSpinner(): void {
        this.spinner.stop();
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

    public getPeckAndStay(): boolean {
        return this.peckAndStay;
    }

    public setPeckAndStay(peckAndStay: boolean): void {
        this.peckAndStay = peckAndStay;
    }

    public getEmit(): boolean {
        return this.emit;
    }

    public getCreator(): boolean {
        return this.creator;
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

    public setIsCreator(): any {
        this.creator = true;
    }

    public unsetIsCreator(): any {
        this.creator = false;
    }


    public getPieceByUniqueId(uniqueId: string): Piece {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    }

    public setSinglePlayer(): void {
        this.gameMode = PlayerMode.SinglePlayer;
        this.emit = false;
        this.enableSocket = false;
        this.creator = true;
    }

    public setMultiPlayer(): void {
        this.gameMode = PlayerMode.Multiplayer;
        this.emit = true;
        this.enableSocket = true;
        this.creator = false;
    }

    public setDefaultPlayer(): void {
        this.gameMode = PlayerMode.Default;
        this.emit = false;
        this.enableSocket = false;
        this.creator = false;
    }

    public getGameMode(): PlayerMode {
        return this.gameMode;
    }

    public checkPlayerId(playerId: string): void {
        if (this.gameMode === PlayerMode.SinglePlayer) {
            //
        }else if (this.gameMode === PlayerMode.Multiplayer) {
           //
           if (playerId === this.currentPlayerId) {
                this.emit = true;
                this.gameIdText.fill = "#00ffff";
                // log.debug("Setting emit to " + this.emit);
            }else {
                this.emit = false;
                this.gameIdText.fill = "#F70C0C";
                // log.debug("Setting emit to " + this.emit);
            }
        }
    }

    public isAdmin(): boolean {
        return this.currentPlayerId === "SOMETHING COMPLETELY RANDOM";
    }

    public setCreatorPlayerName(creatorPlayerId: string): void {
        if (this.currentPlayerId === creatorPlayerId) {
            this.creator = true;
        }else {
            this.creator = false;
        }
    }

    public isSinglePlayer(): boolean {
        return (this.gameMode === PlayerMode.SinglePlayer);
    }

    public isMultiPlayer(): boolean {
        return (this.gameMode === PlayerMode.Multiplayer);
    }

    public isDefaultPlayer(): boolean {
        return (this.gameMode === PlayerMode.Default);
    }

    constructor() {
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use Emit.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
}
