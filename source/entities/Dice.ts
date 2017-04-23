/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Player} from "../entities/Player";
import {Die} from "./Die";
import {factory} from "../logging/ConfigLog4j";
import { UUID } from "angular2-uuid";

const log = factory.getLogger("model.Dice");

export class Dice {
    public dieOne: Die;
    public dieTwo: Die;
    private signal: Phaser.Signal;
    private rolledDoubleSix: boolean;

    constructor(game: Phaser.Game, imageId: string, signal: Phaser.Signal, dieOneUUID: string, dieTwoUUID: string) {
        this.dieOne = new Die(game, 330, 390, imageId, dieOneUUID, signal);
        this.dieTwo = new Die(game, 390, 330, imageId, dieTwoUUID, signal);
        this.signal = signal;
        this.rolledDoubleSix = false;
    }

    public roll(playerId: string, value1?: number, value2?: number): void {
        this.dieOne.roll(playerId, value1);
        this.dieTwo.roll(playerId, value2);
    }

    public getHigherDieValue(): string {
        if (this.dieOne.getValue() > this.dieTwo.getValue()) {
            return this.dieOne.uniqueId;
        }else {
            return this.dieTwo.uniqueId;
        }
    }

    public setDicePlayerId(playerId: string): void {
        this.dieOne.setPlayerId(playerId);
        this.dieTwo.setPlayerId(playerId);
    }
    /**
     * Returns the uniqueId of the first occurrence
     * of the die matching the value
     * @param value
     */
    public getDieUniqueIdByValue(value: number): string {
        if (this.dieOne.getValue() === value) {
            return this.dieOne.uniqueId;
        }else if (this.dieTwo.getValue() === value) {
            return this.dieTwo.uniqueId;
        }else {
            return null;
        }
    }
    /**
     * Returns an array of dice values
     * @param uniqueId
     */
    public getDieValueArrayByUniqueId(uniqueId: string): number[] {
        let uniqueIds: number[] = [];
        let ids = uniqueId.split("#");
        for (let id of ids){
            if (id === this.dieOne.uniqueId ) {
                uniqueIds.push(this.dieOne.getValue());
                break;
            }
        }
        for (let id of ids){
            if (id === this.dieTwo.uniqueId ) {
                uniqueIds.push(this.dieTwo.getValue());
                break;
            }
        }
        return uniqueIds;
    }
    /**
     * Returns an array of uniqueIds of selected dice
     */
    public getSelectedDiceUniqueIds(): string[] {
        let diceUniqueIds: string[] = [];
        if (this.dieOne.isSelected()) {
            diceUniqueIds.push(this.dieOne.uniqueId);
        }
        if (this.dieTwo.isSelected()) {
            diceUniqueIds.push(this.dieTwo.uniqueId);
        }
        return diceUniqueIds;
    }

    public consumeDieValueSix(uniqueId: string): void {
        let ids = uniqueId.split("#");
        for (let id of ids){
            if (id === this.dieOne.uniqueId && this.dieOne.equalsValueSix()) {
                this.dieOne.consume();
                break;
            }
            if (id === this.dieTwo.uniqueId && this.dieTwo.equalsValueSix()) {
                this.dieTwo.consume();
                break;
            }
        }
    }

    public consumeDieValueById(uniqueId: string): void {
        let ids = uniqueId.split("#");
        for (let id of ids){
            if (id === this.dieOne.uniqueId) {
                this.dieOne.consume();
                // log.debug("Die id " + id + " consumed");
            }
            if (id === this.dieTwo.uniqueId) {
                this.dieTwo.consume();
                // log.debug("Die id " + id + " consumed");
            }
        }
    }

    public isDieOneConsumed(): boolean {
        return this.dieOne.isConsumed();
    }
    public isDieTwoConsumed(): boolean {
        return this.dieTwo.isConsumed();
    }
}
