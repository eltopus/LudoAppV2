/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Player} from "../entities/Player";
import {LudoDie} from "../game/LudoDie";
import {factory} from "../logging/ConfigLog4j";
import {EmitDie} from "../emit/EmitDie";
import {Emit} from "../emit/Emit";

const log = factory.getLogger("model.Die");

let emit = Emit.getInstance();
export class Die extends Phaser.Sprite {

    public uniqueId: string;
    public group: Phaser.Group;
    public playerId: string;
    public extFrame: number = null;
    public gameId: string;
    private diceArr: number[] = [5, 1, 6, 2, 0, 4];
    private removeLater = true;
    private signal: Phaser.Signal;
    private pixels: number[] = [];
    private animation: Phaser.Animation;
    private socket: any;
    private emitDice: EmitDie = new EmitDie();

    constructor(game: Phaser.Game, x: number, y: number, imageId: string, uniqueId: string, signal: Phaser.Signal, socket: any, gameId: string) {
        super(game, x, y, imageId);
        this.uniqueId = uniqueId;
        this.signal = signal;
        this.playerId = null;
        this.socket = socket;
        this.gameId = gameId;
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
        this.events.onInputDown.add(this.selectActiveDie, this);
        this.emitDice.gameId = gameId;
        if (emit.getEnableSocket()) {
            this.setSocketHandlers();
        }
        this.frame = 3;
    }

    public selectActiveDie(): void {
        if (this.alpha === 0.5) {
            this.alpha = 1;
            if (emit.getEmit() === true && emit.getEnableSocket()) {
                this.emitDice.setParameters(this);
                this.socket.emit("unselectActiveDie", this.emitDice);
            }
        }else {
            this.alpha = 0.5;
            if (emit.getEmit() === true && emit.getEnableSocket()) {
                this.emitDice.setParameters(this);
                this.socket.emit("selectActiveDie", this.emitDice);
            }
        }
    }

    public select(): void {
        this.alpha = 0.5;
    }

    public unSelectActiveDie(): void {
        this.alpha = 1;
    }

    public isSelected(): boolean {
        return (!this.isConsumed() && this.alpha === 0.5);
    }

    public rollComplete(): void {
        this.frame = this.extFrame;
        this.signal.dispatch("endOfDieRoll");
    }

    public roll(value?: number): void {
        this.resetDice();
        if (value === null || typeof value === "undefined") {
            let rand = Math.floor(Math.random() * 6);
            this.extFrame = this.diceArr[rand];
            this.animation.play(20);
        }else {
            this.extFrame = this.getFrame(value);
            this.animation.play(20);
        }
        if (emit.getEmit() === true && emit.getEnableSocket()) {
            this.emitDice.setParameters(this);
            this.socket.emit("rollDice", this.emitDice);
        }
    }

    public rollEmitDie(emitDieOne: EmitDie, emitDieTwo: EmitDie): void {
        if (emitDieOne.uniqueId === this.uniqueId) {
            this.roll(emitDieOne.dieValue);
        }
        if (emitDieTwo.uniqueId === this.uniqueId) {
            this.roll(emitDieTwo.dieValue);
        }
    }

    public consume(): void {
        this.frame = 3;
        if (emit.getEmit() === true && emit.getEnableSocket()) {
            this.emitDice.setParameters(this);
            this.socket.emit("consumeDie", this.emitDice);
        }
    }

    public consumeWithoutEmission(): void {
        this.frame = 3;
    }

    public resetDice() {
        this.alpha = 1;
        this.visible = true;
    }

    public isConsumed(): boolean {
        return (this.frame === 3);
    }

    public isSpent(): boolean {
        return (this.getValue() === 0);
    }

    public setPlayerId(playerId: string) {
        this.playerId = playerId;
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    public equalsValueSix(): boolean {
        return (this.getValue() === 6);
    }

    public getFrame(value: number): number {
        switch (value) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 5;
            case 4:
                return 6;
            case 5:
                return 4;
            case 6:
                return 0;
            default:
                return 8;
        }
    }

     public setDieFrame(ludoDie: LudoDie): void {
        this.frame = ludoDie.extFrame;
        if (ludoDie.isSelected) {
            this.select();
        }
        if (ludoDie.isConsumed) {
            this.consume();
            this.visible = false;
        }
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

    public getFrameValue(): number {
        switch (this.extFrame) {
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

    private setSocketHandlers(): void {
        this.socket.on("emitSelectActiveDie", (die: EmitDie) => {
            if (emit.getEmit() === false && die.uniqueId === this.uniqueId) {
                log.debug("Select piece: " + die.uniqueId);
                this.select();
            }
        });
        this.socket.on("emitUnselectActiveDie", (die: EmitDie) => {
            if (emit.getEmit() === false && die.uniqueId === this.uniqueId) {
                log.debug("Select piece: " + die.uniqueId);
                this.unSelectActiveDie();
            }
        });
    }

}
