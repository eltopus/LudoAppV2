/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";

export class Player extends PieceFactory {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: Piece[];

    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[]) {
        super(game);
        this.name = name;
        this.playerId = playerId;
        this.turn = turn;
        this.pieces = new Array();

        for (let x = 0; x < colorTypes.length; x++){
            let playerPieces = this.getPiece(colorTypes[x], playerId);
            this.pieces.concat(playerPieces);
        }
    }

}

