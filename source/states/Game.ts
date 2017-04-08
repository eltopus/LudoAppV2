/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {Player} from "../entities/Player";
import {ColorType} from "../enums/ColorType";

export class Game extends Phaser.State {

    public create() {
        this.add.sprite(0, 0, "board");
        let colorTypes = [ColorType.Red, ColorType.Blue];
        let redPlayer: Player = new Player(this.game, "RedPlayer", "x501RedPlayer", true, colorTypes);
       

        let pieces: Piece[] = redPlayer.pieces;

        for (let x = 0; x < pieces.length; x++) {
            console.log("PlayerPieces " + pieces[x].x + " " + pieces[x].y + " " + pieces[x].playerId);
        }
    }
}
