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
    public playerOne: Player;
    public playerTwo: Player;

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Yellow, ColorType.Green];
        let signal = new Phaser.Signal();
        let activeboard: ActiveBoard = new ActiveBoard(signal);
        let homeboard: HomeBoard = new HomeBoard(signal);

        this.playerOne = new Player(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, signal);
        this.playerTwo = new Player(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, signal);
        let playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        let buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        this.game.stage.disableVisibilityChange = true;

        // All Player pieces must be added to homeboard
        for (let piece of this.playerOne.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerTwo.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

        /*
        let p1 = this.playerTwo.pieces[5];
        p1.x = 384;
        p1.y = 672;
        p1.index = 37;
        p1.setActive();
        */




    }

    public playDice(): void {
        let dice = 12;
        if (this.playerOne.currentPiece !== null) {
            this.playerOne.currentPiece.movePiece(dice);
        }
        if (this.playerTwo.currentPiece !== null) {
            this.playerTwo.currentPiece.movePiece(dice);
        }
    }

}
