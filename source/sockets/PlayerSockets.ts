// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as cio from "socket.io-client";
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import {LudoGame} from "../game/LudoGame";
import {EmitDice} from "../emit/EmitDice";
import {LudoDie} from "../game/LudoDie";
import {LudoPiece} from "../game/LudoPiece";
import {Move} from "../rules/Move";

const log = factory.getLogger("model.PlayerSockets");

export class PlayerSockets {
    private socket: any = cio();
    private scheduler: Scheduler;
    private signal: Phaser.Signal;

    constructor(signal: Phaser.Signal) {
        this.signal = signal;
        this.signal.add(this.rollDice, this, 0, "endOfDieRoll");
        this.socket.on("connect", () => {
            log.debug("**Player is connected*****");
        });
    }

    public saveCreatedGameToServer(ludoGame: LudoGame, callback): void {
        this.socket.emit("saveGameToServer", ludoGame, (message: string) => {
            callback(message);
        });
    }

    public setScheduler(scheduler: Scheduler): void {
        this.scheduler = scheduler;
    }

    public rollDice(listener: string, dice: EmitDice): void {
        if (listener === "emitRollDice") {
            this.socket.emit("rollDice", dice, (message) => {
                log.debug("RollDice: " + message);
            });
        }
    }

    public selectDie(die: LudoDie): void {
        this.socket.emit("selectDie", die);
    }

    public unselectDie(die: LudoDie): void {
        this.socket.emit("unselectDie", die);
    }

    public selectPiece(piece: LudoPiece): void {
        this.socket.emit("selectPiece", piece);
    }

    public unselectPiece(piece: LudoPiece): void {
        this.socket.emit("unselectPiece", piece);
    }

    public playPiece(movement: Move): void {
        this.socket.emit("playDice", movement);
    }
}
