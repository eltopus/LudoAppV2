/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {ColorType} from "../enums/ColorType";

export class Game extends Phaser.State {

    public redPiece: Piece;
    public create() {
        this.add.sprite(0, 0, "board");
        this.redPiece = new Piece(this.game, 290, 120, "red_piece", "xxxyyyzzz", ColorType.Red);
    }
}