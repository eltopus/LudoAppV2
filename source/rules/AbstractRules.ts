/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Board} from "../entities/Board";
import {Actions} from "../enums/Actions";
import {Move} from "./Move";
import {Piece} from "../entities/Piece";
import {States} from "../enums/States";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.AbstractRules");


export abstract class AbstractRules {
    protected dice: Dice;
    protected schedule: Scheduler;
    protected rulesPool: Move[];
    protected activeRulePool: Move[];
    protected board: Board;

    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        this.dice = dice;
        this.schedule = schedule;
        this.board = board;
        this.rulesPool = new Array();
        this.activeRulePool = new Array();
        // Define object pooling for rules coz we used them a lot
        for (let i = 0; i < 10; ++i) {
            this.rulesPool.push(new Move());
        }
    }

    /**
     * Returns true if one of the dice value is 6
     */
    public rolledAtLeastOneSix(): boolean {
        return (this.dice.dieOne.getValue() === 6 || this.dice.dieTwo.getValue() === 6);
    }

    /**
     * Returns true if both dice values are 6 and 6
     */
    public rolledDoubleSix(): boolean {
        return (this.dice.dieOne.getValue() === 6 && this.dice.dieTwo.getValue() === 6);
    }

    /**
     * Returns uniqueId of a die that equals the value parameter
     * @param value
     */
    public getDieByValue(value: number): string {
        return (this.dice.getDieUniqueIdByValue(value));
    }


    public getNewRule(): Move {
        let rule: Move = null;

        if (this.rulesPool.length > 0) {
            rule = this.rulesPool.pop();
        }else {
            rule = new Move();
            this.activeRulePool.push(rule);
        }
        return rule;
    }

    public showFinalResults(): void {
        if (this.board instanceof ActiveBoard) {
             log.debug("Active rule: " + this.activeRulePool.length + " RulePool: " + this.rulesPool.length);
        }else if (this.board instanceof HomeBoard) {
            log.debug("Home rule: " + this.activeRulePool.length + " RulePool: " + this.rulesPool.length);
        }
    }

    /**
     *Add spent moves object back to pool
     * @param moves
     */
    public addSpentRulesBackToPool(moves: Move[]): void {
        for (let move of moves){
            this.addToRulePool(move);
        }
    }
    /**
     * Returns array of die uniqueIds that could take piece pass exit point
     * @param piece
     */
    public willCrossEntryPoint(piece: Piece): string[] {
        let uniqueIds: string[] = [];
        let currentIndex = piece.index;
        let destinationIndex1 = currentIndex + this.dice.dieOne.getValue();
        let destinationIndex2 = currentIndex + this.dice.dieTwo.getValue();
        let destinationIndex3 = currentIndex + this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();

        if (!this.dice.isDieOneConsumed() && piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex1) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (!this.dice.isDieTwoConsumed() && piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex2) {
           uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        if ((!this.dice.isDieOneConsumed() && !this.dice.isDieTwoConsumed()) &&
        piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex3) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    }
    /**
     * Returns true if piece will overshoot exit point with
     * die value. Piece needs exact exit value to exit
     * Not a single die value can achieve this so therefore,
     * both dice values are used
     * @param piece
     */
   public willCrossExitPoint(piece: Piece): string[] {
        let uniqueIds: string[] = [];
        let diceValue = this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        let diceDistanceToExitPoint = diceValue - (piece.entryIndex - piece.index);
        let dieOneDistanceToExitPoint = this.dice.dieOne.getValue() - (piece.entryIndex - piece.index);
        let dieTwoDistanceToExitPoint = this.dice.dieTwo.getValue() - (piece.entryIndex - piece.index);
        // log.debug("Distance: " + diceDistanceToExitPoint + " " + dieOneDistanceToExitPoint + " " + dieTwoDistanceToExitPoint);
        if ((!this.dice.isDieOneConsumed() && !this.dice.isDieTwoConsumed()) && diceDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        if (!this.dice.isDieOneConsumed() && dieOneDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (!this.dice.isDieTwoConsumed && dieTwoDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    }

    /**
     * Returns unique id of dice with higher value
     */
    public getHigherDieValue(): string {
        return this.dice.getHigherDieValue();
    }

    protected generatePieceMovement(dieUniqueIds: string[], piece: Piece, state: States): Move {
        let move: Move = this.getNewRule();
        if (dieUniqueIds.length === 2) {
            let uniqueId = dieUniqueIds[0] + "#" + dieUniqueIds[1];
            move.action = Actions.PLAY;
            move.diceId = uniqueId;
            move.state = state;
            move.pieceId = piece.uniqueId;
        }else if (dieUniqueIds.length === 1) {
            let uniqueId = dieUniqueIds[0];
            move.action = Actions.PLAY;
            move.diceId = uniqueId;
            move.state = state;
            move.pieceId = piece.uniqueId;
        }
        return move;
    }

    private addToRulePool(move: Move): void {
        for (let i = 0, l = this.activeRulePool.length; i < l; i++) {
            if (this.activeRulePool[i] === move) {
                this.activeRulePool.splice(i, 1);
            }
        }
        move.resetRule();
        this.rulesPool.push(move);
    }


}
