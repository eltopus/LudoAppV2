/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {Player} from "../entities/Player";
import {ColorType} from "../enums/ColorType";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {Dice} from "../entities/Dice";
import {Rules} from "../rules/Rules";
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import * as Paths from "../entities/Paths";
import {States} from "../enums/States";
import {Board} from "../entities/Board";
import {PiecePosition} from "../entities/PiecePosition";
import {Move} from "../rules/Move";


const log = factory.getLogger("model.Game");

export class Game extends Phaser.State {
    public playerOne: Player;
    public playerTwo: Player;
    public playerThree: Player;
    public playerFour: Player;
    public schedule: Scheduler;
    public dice: Dice;
    public signal: Phaser.Signal;
    public rule: Rules;

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Green, ColorType.Yellow];
        // let playerThreecolors = [ColorType.Blue];
        // let playerFourcolors = [ColorType.Green];
        this.signal = new Phaser.Signal();
        this.signal.add(this.readAllMoves, this, 0, "moves");
        let activeboard: ActiveBoard = new ActiveBoard(this.signal);
        let homeboard: HomeBoard = new HomeBoard(this.signal);
        let onWayOutBoard: OnWayOutBoard = new OnWayOutBoard(this.signal);
        this.playerOne = new Player(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, this.signal);
        this.playerTwo = new Player(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, this.signal);
        // this.playerThree = new Player(this.game, "PlayerThree", UUID.UUID(), true, playerThreecolors, signal);
        // this.playerFour = new Player(this.game, "PlayerFour", UUID.UUID(), false, playerFourcolors, signal);
        this.schedule = new Scheduler();
        this.schedule.schedule.enqueue(this.playerTwo);
        this.schedule.schedule.enqueue(this.playerOne);
        // this.schedule.schedule.enqueue(this.playerThree);
        // this.schedule.schedule.enqueue(this.playerFour);


        let playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        let buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        let diceBtn = this.make.button(770, 440, "diceBtn", this.rollDice, this, 2, 1, 0);
        diceBtn.alpha = 0.5;
        diceBtn.scale.x = 0.2;
        diceBtn.scale.y = 0.2;
        buttonGroup.add(diceBtn);
        this.game.stage.disableVisibilityChange = true;
        let dieOneUUID = UUID.UUID();
        let dieTwoUUID = UUID.UUID();
        this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID);

        this.rule = new Rules(this.signal, this.schedule, this.dice, activeboard, homeboard, onWayOutBoard);

        // All Player pieces must be added to homeboard
        for (let piece of this.playerOne.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerTwo.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

        let p1 = this.playerTwo.pieces[2];
        homeboard.removePieceFromHomeBoard(p1);
        this.setActivePieceParameters(p1, 37, States.Active, activeboard);
        let p2 = this.playerTwo.pieces[3];
        homeboard.removePieceFromHomeBoard(p2);
        this.setOnWayOutPieceParameters(p2, 2, States.onWayOut, onWayOutBoard);

        /*
        for (let piece of this.playerThree.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerFour.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        */
    }

    public rollDice(): void {
        this.dice.setDicePlayerId(this.playerTwo.playerId);
        this.playerTwo.roll(this.dice);
    }

    public playDice(): void {
        let dice = this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        if (this.playerOne.currentPiece !== null) {
            this.playerOne.currentPiece.movePiece(dice);
        }
        if (this.playerTwo.currentPiece !== null) {
            this.playerTwo.currentPiece.movePiece(dice);
        }

        /*
        if (this.playerThree.currentPiece !== null) {
            this.playerThree.currentPiece.movePiece(dice);
        }
        if (this.playerFour.currentPiece !== null) {
            this.playerFour.currentPiece.movePiece(dice);
        }
        */
        // let player = this.schedule.getNextPlayer();

    }

    public readAllMoves(listener: string, moves: Move[]): void {
        if (listener === "moves") {
            for (let move of moves){
               log.debug( this.rule.decodeMoves(move));
            }
           this.rule.addSpentMovesBackToPool(moves);
        }
    }

    private setActivePieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.ActivePath();
        let position = path.getPiecePostionByIndex(index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

    private setOnWayOutPieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.OnWayOutPaths();
        let position = path.getPiecePostionByIndex(piece, index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

}
