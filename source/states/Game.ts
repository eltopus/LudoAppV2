/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {AIPlayer} from "../entities/AIPlayer";
import {Player} from "../entities/Player";
import {RegularPlayer} from "../entities/RegularPlayer";
import {ColorType} from "../enums/ColorType";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {ExitedBoard} from "../entities/ExitedBoard";
import {AllPossibleMoves} from "../rules/AllPossibleMoves";
import {Dice} from "../entities/Dice";
import {Rules} from "../rules/Rules";
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import {RuleEnforcer} from "../rules/RuleEnforcer";
import * as Paths from "../entities/Paths";
import {States} from "../enums/States";
import {Board} from "../entities/Board";
import {PiecePosition} from "../entities/PiecePosition";
import {Move} from "../rules/Move";


const log = factory.getLogger("model.Game");

export class Game extends Phaser.State {
    public playerOne: Player;
    public playerTwo: Player;
    public playerThree: RegularPlayer;
    public playerFour: RegularPlayer;
    public dice: Dice;
    public signal: Phaser.Signal;
    public enforcer: RuleEnforcer;
    public scheduler: Scheduler;

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Yellow, ColorType.Green];
        // let playerThreecolors = [ColorType.Yellow];
        // let playerFourcolors = [ColorType.Green];
        this.signal = new Phaser.Signal();
        let activeboard: ActiveBoard = new ActiveBoard(this.signal);
        let homeboard: HomeBoard = new HomeBoard(this.signal);
        let onWayOutBoard: OnWayOutBoard = new OnWayOutBoard(this.signal);
        let exitedBoard: ExitedBoard = new ExitedBoard(this.signal);
        let currentPossibleMovements: AllPossibleMoves = new AllPossibleMoves();


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
        this.scheduler = new Scheduler(this.dice);
        this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard,
        onWayOutBoard, exitedBoard, currentPossibleMovements);
        this.playerOne = new AIPlayer(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, this.signal, this.enforcer);
        this.playerTwo = new AIPlayer(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, this.signal, this.enforcer);
        // this.playerThree = new AIPlayer(this.game, "PlayerThree", UUID.UUID(), true, playerThreecolors, this.signal, this.enforcer);
        // this.playerFour = new AIPlayer(this.game, "PlayerFour", UUID.UUID(), true, playerFourcolors, this.signal, this.enforcer);
        this.scheduler.enqueue(this.playerOne);
        this.scheduler.enqueue(this.playerTwo);
        // this.scheduler.enqueue(this.playerThree);
        // this.scheduler.enqueue(this.playerFour);
        this.dice.setDicePlayerId(this.scheduler.getCurrentPlayer().playerId);

        // All Player pieces must be added to homeboard
        for (let piece of this.playerOne.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerTwo.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

         /*
        for (let piece of this.playerThree.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerFour.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

        for (let x = 2; x < this.playerOne.pieces.length; x++) {
            homeboard.removePieceFromHomeBoard(this.playerOne.pieces[x]);
            exitedBoard.addPieceToActiveBoard(this.playerOne.pieces[x]);
            this.playerOne.pieces[x].setExited();
            this.playerOne.pieces[x].visible = false;
        }

        let p1 = this.playerOne.pieces[0];
        homeboard.removePieceFromHomeBoard(p1);
        // this.setOnWayOutPieceParameters(p1, 2, States.onWayOut, onWayOutBoard);
        this.setActivePieceParameters(p1, 48, States.Active, activeboard);

        let p2 = this.playerOne.pieces[1];
        homeboard.removePieceFromHomeBoard(p2);
        this.setOnWayOutPieceParameters(p2, 3, States.onWayOut, onWayOutBoard);
        // this.setActivePieceParameters(p2, 38, States.Active, activeboard);
        
        let p3 = this.playerTwo.pieces[0];
        homeboard.removePieceFromHomeBoard(p3);
        // this.setOnWayOutPieceParameters(p3, 4, States.onWayOut, onWayOutBoard);
        this.setActivePieceParameters(p3, 50, States.Active, activeboard);


        let p4 = this.playerTwo.pieces[1];
        homeboard.removePieceFromHomeBoard(p4);
        this.setOnWayOutPieceParameters(p4, 3, States.onWayOut, onWayOutBoard);
        // this.setActivePieceParameters(p4, 43, States.Active, activeboard);

        let p5 = this.playerTwo.pieces[7];
        homeboard.removePieceFromHomeBoard(p5);
        // this.setOnWayOutPieceParameters(p5, 3, States.onWayOut, onWayOutBoard);
        this.setActivePieceParameters(p5, 1, States.Active, activeboard);
        */

        if (this.scheduler.getCurrentPlayer().isAI) {
            this.signal.dispatch("aiRollDice", this.dice, this.scheduler.getCurrentPlayer().playerId);
        }

        this.enforcer.rule.checkBoardConsistencies();


    }

    public rollDice(): void {
        this.dice.setDicePlayerId(this.enforcer.scheduler.getCurrentPlayer().playerId);
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice, 3, 2);
    }

    public playDice(): void {
        let dieIds = this.dice.getSelectedDiceUniqueIds();
        let player = this.scheduler.getCurrentPlayer();

        if (player.currentSelectedPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentSelectedPiece);
        }else {
            log.debug("No die selected or no piece selected");
        }
    }

    public update(): void {
        //
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
