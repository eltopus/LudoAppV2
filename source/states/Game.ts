/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {Player} from "../entities/Player";
import {ColorType} from "../enums/ColorType";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {factory} from "../logging/ConfigLog4j";
import * as Path from "../entities/Path";


const log = factory.getLogger("model.Game");

export class Game extends Phaser.State {

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Yellow, ColorType.Green];
        let signal = new Phaser.Signal();
        let activeboard: ActiveBoard = new ActiveBoard(signal);
        let homeboard: HomeBoard = new HomeBoard(signal);

        let playerOne: Player = new Player(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, signal);
        let playerTwo: Player = new Player(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, signal);

        // All Player pieces must be added to homeboard
        for (let piece of playerOne.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of playerTwo.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

        let p1 = playerOne.pieces[2];
        let p2 = playerOne.pieces[5];
        let p3 = playerTwo.pieces[2];
        let p4 = playerTwo.pieces[5];
        p1.movePiece(9);
        p2.movePiece(12);
        p3.movePiece(7);
        p4.movePiece(16);

    }

}
