// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import {LudoGame} from "../game/LudoGame";
import {EmitDice} from "../emit/EmitDice";
import {Emit} from "../emit/Emit";
import {LudoDie} from "../game/LudoDie";
import {LudoPiece} from "../game/LudoPiece";
import {Move} from "../rules/Move";
import {RuleEnforcer} from "../rules/RuleEnforcer";

const log = factory.getLogger("model.PlayerSockets");

let emit = Emit.getInstance();
export class PlayerSockets {
    private socket: any;
    constructor(socket: any) {
        this.socket = socket;
    }

    public saveCreatedGameToServer(ludoGame: LudoGame, callback): void {
        this.socket.emit("saveGameToServer", ludoGame, (message: string) => {
            callback(message);
        });
    }

    public joinExistingGame(gameId: string, callback): void {
        this.socket.emit("joinExistingGame", gameId, (message: string) => {
            callback(message);
        });
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
