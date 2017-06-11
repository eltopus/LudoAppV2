import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {PiecePosition} from "../entities/PiecePosition";
import {LudoPiece} from "./LudoPiece";
import {LudoPlayer} from "./LudoPlayer";
import {LudoDice} from "./LudoDice";
import {Dice} from "../entities/Dice";
import {Player} from "../entities/Player";


export class LudoGame {
    public ludoPlayers: LudoPlayer[] = [];
    public ludoDice: LudoDice;
    public gameId: string;
    public playerTurn = false;
    public availableColors = ["RED", "BLUE", "YELLOW", "GREEN"];
    public currrentPlayerId = "";
    public playerId = "";
    public inProgress = false;
    public playerMode: number = null;

    constructor(players: Player[], dice: Dice, gameId: string) {
        for (let player of players){
            let ludoPlayer = new LudoPlayer(player);
            this.ludoPlayers.push(ludoPlayer);
        }
        this.ludoDice = new LudoDice(dice);
        this.gameId = gameId;
    }
}
