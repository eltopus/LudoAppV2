/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Player} from "../entities/Player";
import {Die} from "./Die";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Dice");

export class Dice {
    public dieOne: Die;
    public dieTwo: Die;
    private signal: Phaser.Signal;

    constructor(game: Phaser.Game, imageId: string, uniqueId: string, signal: Phaser.Signal) {
        this.dieOne = new Die(game, 330, 390, imageId, uniqueId, signal);
        this.dieTwo = new Die(game, 390, 330, imageId, uniqueId, signal);
        this.signal = signal;
    }

    public roll(playerId: string): void {
        this.dieOne.roll(playerId);
        this.dieTwo.roll(playerId);
    }

    public setDicePlayerId(playerId: string): void {
        this.dieOne.setPlayerId(playerId);
        this.dieTwo.setPlayerId(playerId);
    }

}
