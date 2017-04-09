/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {Move} from "../movement/PieceMovement";
import {PiecePosition} from "../entities/PiecePosition";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Piece");

export interface PieceInterface {
    group: Phaser.Group;
    playerId: string;
    uniqueId: string;
    index: number;
    startIndex: number;
    state: States;
    startPosition: PiecePosition;
    homePosition: PiecePosition;
    signal: Phaser.Signal;
    movePiece(newIndex: number): void;
}

export class Piece extends Phaser.Sprite implements PieceInterface {

    public group: Phaser.Group;
    public color: ColorType;
    public playerId: string;
    public uniqueId: string;
    public index: number;
    public startIndex: number;
    public state: States;
    public startPosition: PiecePosition;
    public homePosition: PiecePosition;
    public signal: Phaser.Signal;

    constructor(game: Phaser.Game, x: number, y: number, imageId: string, color: ColorType,
    playerId: string, uniqueId: string, startPosition: PiecePosition, signal: Phaser.Signal) {
        super(game, x, y, imageId);
        this.color = color;
        this.playerId = playerId;
        this.uniqueId = uniqueId;
        this.startPosition = startPosition;
        this.homePosition = new PiecePosition(x, y);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.frame = 0;
        this.index = -1;
        this.startIndex = this.getStartIndex(color);
        this.state = States.AtHome;
        this.group = this.game.add.group();
        this.signal = signal;
        this.group.add(this);
        this.scale.x = 1.1;
        this.scale.y = 1.1;
        this.anchor.x = -0.07;
        this.anchor.y = -0.07;
        this.inputEnabled = true;
        this.events.onInputDown.add(this.moveToHome, this);
    }

    public movePiece(newIndex: number): void {
        if (this.isAtHome) {
            this.state = States.Active;
        }
    }

    public isAtHome(): boolean {
        return (this.state === States.AtHome);
    }
    public isActive(): boolean {
        return (this.state === States.Active);
    }
    public isOnWayOut(): boolean {
        return (this.state === States.onWayOut);
    }
    public isExited(): boolean {
        return (this.state === States.Exited);
    }

    public moveToStart(): void {
        this.state = States.Active;
        this.index = this.startIndex;
        this.signal.dispatch("eom", this.uniqueId, this.index);
        this.game.world.bringToTop(this.group);
        let tween = this.game.add.tween(this).to({ x: this.startPosition.x, y: this.startPosition.y}, 1000,
        Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.dispatchEndOfMovement, this);
    }

    public moveToHome(): void {
        this.state = States.AtHome;
        this.signal.dispatch("backToHome", this.uniqueId, this.index);
        this.index = -1;
        this.game.world.bringToTop(this.group);
        this.game.add.tween(this).to({ x: this.homePosition.x, y: this.homePosition.y}, 1000,
        Phaser.Easing.Linear.None, true);
    }

    public dispatchEndOfMovement(): void {
        //this.signal.dispatch("eom", this.uniqueId, this.index);
    }

    public getStartIndex(color: ColorType): number {
        switch (color) {
            case ColorType.Red:
            return 1;
            case ColorType.Blue:
            return 14;
            case ColorType.Yellow:
            return 27;
            case ColorType.Green:
            return 40;
            default:
            return 0;
        }
    }
}


