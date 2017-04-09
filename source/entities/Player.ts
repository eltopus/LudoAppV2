/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Player");

export interface PlayerInterface {
    name: string;
    playerId: string;
    turn: boolean;
    pieces: Piece[];
}

export class Player extends PieceFactory implements PlayerInterface {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: Piece[] = [];

    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[]) {
        super(game);
        this.name = name;
        this.playerId = playerId;
        this.turn = turn;
        this.pieces = new Array<Piece>();

        for (let x = 0; x < colorTypes.length; x++) {
            let playerPieces = this.getPiece(colorTypes[x], playerId);
            for (let piece of playerPieces){
                this.pieces.push(piece);
            }
        }
    }

}

