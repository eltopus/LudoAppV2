/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Board} from "../entities/Board";
import {Actions} from "../enums/Actions";
import {Rule} from "./Rule";
import {Piece} from "../entities/Piece";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.AbstractRules");


export abstract class AbstractRules {
    protected dice: Dice;
    protected schedule: Scheduler;
    protected rulesPool: Rule[];
    protected activeRulePool: Rule[];
    protected board: Board;

    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        this.dice = dice;
        this.schedule = schedule;
        this.board = board;
        this.rulesPool = new Array();
        this.activeRulePool = new Array();
        // Define object pooling for rules coz we used them a lot
        for (let i = 0; i < 10; ++i) {
            this.rulesPool.push(new Rule());
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
        return (this.dice.getDieByValue(value));
    }


    public getNewRule(): Rule {
        let rule: Rule = null;

        if (this.rulesPool.length > 0) {
            rule = this.rulesPool.pop();
        }else {
            rule = new Rule();
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
     *Add spent rules object back to pool
     * @param rules
     */
    public addSpentRulesBackToPool(rules: Rule[]): void {
        for (let rule of rules){
            this.addToRulePool(rule);
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

        // log.debug("currentIndex " + currentIndex + " dest1: " + destinationIndex1 + " " + destinationIndex2 + " " + destinationIndex3);

        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex1) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex2) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex3) {
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
        log.debug("Distance: " + diceDistanceToExitPoint + " " + dieOneDistanceToExitPoint + " " + dieTwoDistanceToExitPoint);
        if (diceDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        if (dieOneDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (dieTwoDistanceToExitPoint < 7) {
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

    private addToRulePool(rule: Rule): void {
        for (let i = 0, l = this.activeRulePool.length; i < l; i++) {
            if (this.activeRulePool[i] === rule) {
                this.activeRulePool.splice(i, 1);
               // log.debug("Deleting from active pieces " + this.activeRules.length);
            }
        }
        rule.resetRule();
        this.rulesPool.push(rule);
    }


}
