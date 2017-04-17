/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Player} from "../entities/Player";
import {factory} from "../logging/ConfigLog4j";
const log = factory.getLogger("model.Die");

export class Die extends Phaser.Sprite {

    public uniqueId: string;
    public group: Phaser.Group;
    private signal: Phaser.Signal;
    private pixels: number[] = [];
    private animation: Phaser.Animation;
    private playerId: string;
    private diceArr: number[] = [5, 1, 6, 2, 0, 4];

    constructor(game: Phaser.Game, x: number, y: number, imageId: string, uniqueId: string, signal: Phaser.Signal) {
        super(game, x, y, imageId);
        this.uniqueId = uniqueId;
        this.signal = signal;
        this.playerId = null;
        this.group = this.game.add.group();
        this.group.add(this);
        this.frame = 1;
        this.anchor.setTo(0.5, 0.5);
        this.inputEnabled = true;
        for (let i = 0; i < 15; i++) {
            this.pixels[i] = this.game.rnd.pick([0, 1, 2, 4, 5, 6]);
        }

        this.animation = this.animations.add("roll", this.pixels);
        this.animation.onComplete.add(this.rollComplete, this);
    }

    public rollComplete(): void {
        // log.debug("Roll complete");
        let rand = Math.floor(Math.random() * 6);
        this.frame = this.diceArr[rand];
        // this.frame = 0;
        this.signal.dispatch("endOfDieRoll");
    }

    public roll(playerId: string): void {
        if (this.playerId === playerId) {
             this.animation.play(20);
        }else {
            log.debug("Dice PlayerId " + this.playerId + " does not match playerId: " + playerId);
        }
    }

    public consume(): void {
        this.frame = 1;
    }

    public isConsume(): boolean {
        return (this.frame === 1);
    }

    public setPlayerId(playerId: string) {
        this.playerId = playerId;
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    public getValue(): number {
        switch (this.frame) {
            case 0:
                return 6;
            case 1:
                return 1;
            case 2:
                return 2;
            case 4:
                return 5;
            case 5:
                return 3;
            case 6:
                return 4;
            default:
                return 0;
        }
    }

}
