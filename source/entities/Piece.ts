/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {Move} from "../movement/PieceMovement";
import {PiecePosition} from "../entities/PiecePosition";

export interface PieceInterface {
    group: Phaser.Group;
    playerId: string;
    uniqueId: string;
    index: number;
    state: States;
    startPosition: PiecePosition;
    homePosition: PiecePosition;
    movePiece(newIndex: number): void;
}

export class Piece extends Phaser.Sprite implements PieceInterface {

    public group: Phaser.Group;
    public color: ColorType;
    public playerId: string;
    public uniqueId: string;
    public index: number;
    public state: States;
    public startPosition: PiecePosition;
    public homePosition: PiecePosition;

    constructor(game: Phaser.Game, x: number, y: number, imageId: string, color: ColorType, 
    playerId: string, uniqueId: string, startPosition: PiecePosition) {
        super(game, x, y, imageId);
        this.color = color;
        this.playerId = playerId;
        this.uniqueId = uniqueId;
        this.startPosition = startPosition;
        this.homePosition = new PiecePosition(x, y);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.frame = 0;
        this.index = -1;
        this.state = States.AtHome;
        this.group = this.game.add.group();
        this.group.add(this);
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
        this.game.world.bringToTop(this.group);
        let tween = this.game.add.tween(this).to({ x: this.startPosition.x, y: this.startPosition.y}, 1000,
        Phaser.Easing.Linear.None, true);
    }
}


