/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {Player} from "../entities/Player";
import {ColorType} from "../enums/ColorType";
import {Board} from "../entities/Board";
import {factory} from "../logging/ConfigLog4j";


const log = factory.getLogger("model.Game");

export class Game extends Phaser.State {

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Yellow, ColorType.Green];
        let signal = new Phaser.Signal();
        let board: Board = new Board(signal);
        let playerOne: Player = new Player(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, signal);
        let playerTwo: Player = new Player(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, signal);

        let p1 = playerOne.pieces[2];
        p1.moveToStart();

        let p2 = playerOne.pieces[5];
        p2.moveToStart();

        let p3 = playerTwo.pieces[2];
        p3.moveToStart();

        let p4 = playerTwo.pieces[5];
        p4.moveToStart();

        let uniqueIds = board.activeBoard.getValue(12);

    }

}
