/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {Move} from "../movement/Movement";
import {PiecePosition} from "../entities/PiecePosition";
import {factory} from "../logging/ConfigLog4j";
import {Path} from "../entities/Path";

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
    speedConstant: number;
    signal: Phaser.Signal;
    movePiece(newIndex: number): void;
    movePieceTo(path: Path, speed: number): void;
    setActivePiece(uniqueId: string): void;
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
    public movement: Move;
    public speedConstant: number;

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
        this.movement = new Move();
        this.speedConstant = 6000 * 12;
        this.events.onInputDown.add(this.setActivePiece, this);
    }

    public movePiece(newIndex: number): void {
        if (this.isAtHome) {
            this.index = this.startIndex;
        }
        let path = this.movement.constructActivePath(this, newIndex);
        this.signal.dispatch("eom", this.uniqueId, this.index);
        this.game.world.bringToTop(this.group);
        let speed = this.getSpeed(path.x.length);
        this.movePieceTo(path, speed);
    }

    public movePieceTo(path: Path, speed: number): void {
        let tween = this.game.add.tween(this).to(path, 6000,
        Phaser.Easing.Linear.None, true).interpolation(function(v: number[], k: number){
            return Phaser.Math.linearInterpolation(v, k);
        });
    }
    /**
     * Moves piece to homePosition
     * Sends backToHome signal to Game and Board child classes
     */
    public moveToHome(): void {
        this.state = States.AtHome;
        this.signal.dispatch("backToHome", this.uniqueId, this.index);
        this.index = -1;
        this.game.world.bringToTop(this.group);
        this.game.add.tween(this).to({ x: this.homePosition.x, y: this.homePosition.y}, 1000,
        Phaser.Easing.Linear.None, true);
    }
    public getSpeed(distance: number) {
        return Math.floor(this.speedConstant / distance);
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
    public setAtHome(): void {
        this.state = States.AtHome;
    }
    public setActive(): void {
        this.state = States.Active;
    }
    public setExited(): void {
        this.state = States.Exited;
    }

    /**
     * Dispatches select signal to player
     * Player and piece must have the same player id
     * @param uniqueId
     */
    public setActivePiece(): void {
        this.signal.dispatch("select", this.uniqueId, this.playerId);
    }
    /**
     * Dispatches select signal to player
     * Player and piece must have the same player id
     * @param uniqueId
     */
    public unsetActivePiece(): void {
        this.signal.dispatch("unselect", this.uniqueId, this.playerId);
        this.frame = 0;
    }
    /**
     * Always use this method to get index of piece
     */
    public getCurrentIndex(): number {
        if (this.isActive()) {
            return (this.index % 51);
        }else if (this.isAtHome) {
            return this.index % 6;
        }else {
            return this.index;
        }
    }

    public select(): void {
        this.frame = 1;
    }

    public unselect(): void {
        this.frame = 0;
    }

    public ifYouAre(color: ColorType): boolean {
        return (color === this.color);
    }

    public getExitIndex(): number {
        switch (this.color) {
            case ColorType.Red:
            return 51;
            case ColorType.Blue:
            return 12;
            case ColorType.Yellow:
            return 25;
            case ColorType.Green:
            return 38;
            default:
            return -1;
        }
    }

    private getStartIndex(color: ColorType): number {
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


