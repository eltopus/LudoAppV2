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
    public playerThree: Player;
    public playerFour: Player;
    public dice: Dice;
    public signal: Phaser.Signal;
    public enforcer: RuleEnforcer;
    public scheduler: Scheduler;

    public create() {
        this.add.sprite(0, 0, "board");
        let playerOnecolors = [ColorType.Red, ColorType.Blue];
        let playerTwocolors = [ColorType.Green, ColorType.Yellow];
        // let playerThreecolors = [ColorType.Blue];
        // let playerFourcolors = [ColorType.Green];
        this.signal = new Phaser.Signal();
        let activeboard: ActiveBoard = new ActiveBoard(this.signal);
        let homeboard: HomeBoard = new HomeBoard(this.signal);
        let onWayOutBoard: OnWayOutBoard = new OnWayOutBoard(this.signal);
        this.playerOne = new Player(this.game, "PlayerOne", UUID.UUID(), true, playerOnecolors, this.signal);
        this.playerTwo = new Player(this.game, "PlayerTwo", UUID.UUID(), false, playerTwocolors, this.signal);
        // this.playerThree = new Player(this.game, "PlayerThree", UUID.UUID(), true, playerThreecolors, signal);
        // this.playerFour = new Player(this.game, "PlayerFour", UUID.UUID(), false, playerFourcolors, signal);
        this.scheduler = new Scheduler();
        this.scheduler.enqueue(this.playerTwo);
        this.scheduler.enqueue(this.playerOne);
        // this.schedule.enqueue(this.playerThree);
        // this.schedule.enqueue(this.playerFour);


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
        this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard, onWayOutBoard);
        this.dice.setDicePlayerId(this.scheduler.getCurrentPlayer().playerId);

        // All Player pieces must be added to homeboard
        for (let piece of this.playerOne.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }
        for (let piece of this.playerTwo.pieces){
            homeboard.addPieceToHomeBoard(piece);
        }

        let p1 = this.playerOne.pieces[2];
        homeboard.removePieceFromHomeBoard(p1);
        // this.setOnWayOutPieceParameters(p1, 0, States.onWayOut, onWayOutBoard);
        this.setActivePieceParameters(p1, 44, States.Active, activeboard);
        let p2 = this.playerTwo.pieces[3];
        homeboard.removePieceFromHomeBoard(p2);
        this.setOnWayOutPieceParameters(p2, 4, States.onWayOut, onWayOutBoard);
        // this.setActivePieceParameters(p2, 38, States.Active, activeboard);
        let p3 = this.playerTwo.pieces[4];
        homeboard.removePieceFromHomeBoard(p3);
        // this.setOnWayOutPieceParameters(p3, 4, States.onWayOut, onWayOutBoard);
        this.setActivePieceParameters(p3, 43, States.Active, activeboard);

        let p4 = this.playerTwo.pieces[1];
        homeboard.removePieceFromHomeBoard(p4);
        this.setOnWayOutPieceParameters(p4, 3, States.onWayOut, onWayOutBoard);
        // this.setActivePieceParameters(p4, 43, States.Active, activeboard);

        let p5 = this.playerTwo.pieces[7];
        homeboard.removePieceFromHomeBoard(p5);
        this.setOnWayOutPieceParameters(p5, 3, States.onWayOut, onWayOutBoard);
        // this.setActivePieceParameters(p5, 43, States.Active, activeboard);

    }

    public rollDice(): void {
        this.dice.setDicePlayerId(this.enforcer.scheduler.getCurrentPlayer().playerId);
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice, 6, 1);
    }

    public playDice(): void {
        let dieIds = this.dice.getSelectedDiceUniqueIds();
        let player = this.scheduler.getCurrentPlayer();

        if (player.currentPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentPiece);
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
