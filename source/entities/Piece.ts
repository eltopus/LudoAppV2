/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {PieceMovement} from "../movement/Movement";
import {PiecePosition} from "../entities/PiecePosition";
import {factory} from "../logging/ConfigLog4j";
import {Path} from "../entities/Path";
// import * as Phasertips from "../Phasertips";

const log = factory.getLogger("model.Piece");

export interface PieceInterface {
    group: Phaser.Group;
    color: ColorType;
    playerId: string;
    uniqueId: string;
    index: number;
    startIndex: number;
    state: States;
    startPosition: PiecePosition;
    homePosition: PiecePosition;
    movement: PieceMovement;
    speedConstant: number;
    signal: Phaser.Signal;
    entryIndex: number;
    isAtHome(): boolean;
    isAtEntryPoint(): boolean;
    isActive(): boolean;
    isOnWayOut(): boolean;
    setExited(): void;
    setOnWayOut(): void;
    setActive(): void;
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
    public movement: PieceMovement;
    public speedConstant: number;
    public entryIndex: number;
    public notifyCollision: boolean;
    public collidingPiece: Piece;
      // public tips: Phasertips;

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
        this.entryIndex = this.getEntryIndex();
        this.startIndex = this.getStartIndex(color);
        this.state = States.AtHome;
        this.group = this.game.add.group();
        this.group.add(this);
        this.signal = signal;
        this.scale.x = 1.1;
        this.scale.y = 1.1;
        this.anchor.x = -0.07;
        this.anchor.y = -0.07;
        this.inputEnabled = true;
        this.movement = new PieceMovement(signal);
        this.speedConstant = 6000 * 12;
        this.collidingPiece = null;
        // this.tips = new Phasertips(game, {targetObject: this, context: this.uniqueId, strokeColor: 0xff0000 });
        this.events.onInputDown.add(this.setActivePiece, this);

    }

    public constructPath(newIndex: number): Path {
        let path: Path = new Path();
        if (this.isOnWayOut()) {
            path = this.movement.constructOnWayOutPath(this, this.index, newIndex);
        }
        if (this.isActive() || this.isAtHome()) {
            path = this.movement.constructActivePath(this, newIndex);
        }
        return path;
    }

    public movePiece(path: Path): void {
        this.signal.dispatch("startmovement", this);
        this.game.world.bringToTop(this.group);
        let speed = this.getSpeed(path.x.length);
        this.movePieceTo(path, speed);
    }

    public onCompleteMovement(): void {
        if (this.collidingPiece !== null) {
            this.collidingPiece.moveToHome();
            this.collidingPiece = null;
        }
        if (this.isExited()) {
            this.visible = false;
        }
        this.signal.dispatch("completeMovement", this);
    }
    /**
     * Moves piece to homePosition
     * Sends backToHome signal to Game and Board child classes
     */
    public moveToHome(): void {
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
        this.index = -1;
        this.signal.dispatch("backToHome", this);
    }
    public setActive(): void {
        this.state = States.Active;
        this.signal.dispatch("rom", this);
    }
    public setExited(): void {
        this.state = States.Exited;
        this.signal.dispatch("exit", this);
    }
    public setOnWayOut(): void {
        this.state = States.onWayOut;
        this.signal.dispatch("onwayout", this);
    }
    public isAtEntryPoint(): boolean {
        return (this.index === this.entryIndex);
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

    public select(): void {
        this.frame = 1;
    }

    public unselect(): void {
        this.frame = 0;
    }

    public ifYouAre(color: ColorType): boolean {
        return (color === this.color);
    }

    public getEntryIndex(): number {
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

    public getColor(): string {
        switch (this.color) {
            case ColorType.Red:
            return "RED";
            case ColorType.Blue:
            return "BLUE";
            case ColorType.Yellow:
            return "YELLOW";
            case ColorType.Green:
            return "GREEN";
            default:
            return "";
        }
    }

    public getState(): string {
        switch (this.state) {
            case States.Active:
            return "ACTIVE";
            case States.AtHome:
            return "AT HOME";
            case States.Exited:
            return "EXITED";
            case States.onWayOut:
            return "ON WAY OUT";
            default:
            return "";
        }
    }
    public setParameters(x: number, y: number, index: number, state: States): void {
        this.x = x;
        this.y = y;
        this.state = state;
        this.index = index;
    }

    private movePieceTo(path: Path, speed: number): void {
        let tween = this.game.add.tween(this).to(path, 1000,
        Phaser.Easing.Linear.None, true).interpolation(function(v: number[], k: number){
            return Phaser.Math.linearInterpolation(v, k);
        });
        tween.onComplete.add(this.onCompleteMovement, this);
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
