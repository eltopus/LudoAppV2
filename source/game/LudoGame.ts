import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {LudoGameStatus} from "../enums/LudoGameStatus";
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
    public status = LudoGameStatus.NEW;
    public playerMode: number = null;
    public indexTotal = 0;
    public originalLudoGame = "";
    public sequenceNumber = 0;
    public creatorPlayerId = "";

    constructor(players: Player[], dice: Dice, gameId: string) {
        for (let player of players){
            let ludoPlayer = new LudoPlayer(player);
            this.ludoPlayers.push(ludoPlayer);
        }
        this.ludoDice = new LudoDice(dice);
        this.gameId = gameId;
    }
}
