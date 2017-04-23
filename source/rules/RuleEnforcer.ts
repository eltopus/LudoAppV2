// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Rules} from "../rules/Rules";
import {Player} from "../entities/Player";
import {Piece} from "../entities/Piece";
import {Move} from "./Move";
import {Board} from "../entities/Board";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {factory} from "../logging/ConfigLog4j";
import {AllPossibleMoves} from "./AllPossibleMoves";

const log = factory.getLogger("model.RuleEnforcer");

export class RuleEnforcer {
    public rule: Rules;
    public scheduler: Scheduler;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private currentPossibleMovements: AllPossibleMoves;
    private dice: Dice;

    constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeboard: ActiveBoard,
    homeboard: HomeBoard, onWayOutBoard: OnWayOutBoard, currentPossibleMovements?: AllPossibleMoves) {
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
    }

    public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.generateAllPossibleMoves();
            }
        }
    }

    /**
     * Generates move object using selected piece and selected die or dice
     * @param dieIds
     * @param piece
     */
    public generatePieceMovement(dieIds: string[], piece: Piece): Move {
        let pieceMovement = this.rule.generatePieceMovement(dieIds, piece);
        let canPlay = false;
        let movements = this.currentPossibleMovements.getPieceMoves(piece.state);
        for (let movement of movements) {
            if (movement.compare(pieceMovement)) {
                canPlay = true;
                movement = this.filterMovement(movement, piece);
                let diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(movement.diceId));
                this.dice.consumeDieValueById(movement.diceId);
                piece.movePiece(diceValue);
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
                this.currentPossibleMovements.resetMoves();
                this.generateAllPossibleMoves();
                break;
            }
        }
        if (!canPlay) {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
        }
        return pieceMovement;
    }

    public readAllMoves(): void {
        for (let move of this.currentPossibleMovements.activeMoves){
            log.debug( this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.homeMoves){
            log.debug( this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.onWayOutMoves){
            log.debug( this.rule.decodeMove(move));
        }
    }

    public addDiceValues(diceValues: number[]): number {
        let value = 0;
        for (let dieValue of diceValues){
            value += dieValue;
        }
        return value;
    }

    private filterMovement(movement: Move, piece: Piece): Move {
        if (piece.isAtHome()) {
            this.dice.consumeDieValueSix(movement.diceId);
            piece.index = piece.startIndex;
        }
        return movement;
    }

    private generateAllPossibleMoves(): void {
        let player: Player = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(player);
        this.analyzeAllPossibleMove(player);
    }

    private analyzeAllPossibleMove(player: Player): void {
        if (this.currentPossibleMovements.isEmpty()) {
            let p = this.scheduler.getNextPlayer();
        }
        this.readAllMoves();
    }
}
