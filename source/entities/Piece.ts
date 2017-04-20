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
    public movement: PieceMovement;
    public speedConstant: number;
    public entryIndex: number;
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
        this.movement = new PieceMovement();
        this.speedConstant = 6000 * 12;
        // this.tips = new Phasertips(game, {targetObject: this, context: this.uniqueId, strokeColor: 0xff0000 });
        this.events.onInputDown.add(this.setActivePiece, this);
    }

    public movePiece(newIndex: number): void {
        // If piece hasn't come out yet
        if (this.isAtHome()) {
            this.index = this.startIndex;
            // log.debug("Piece is still at home " + this.index);
        }
        if (this.isOnWayOut()){
            let path = this.movement.constructOnWayOutPath(this, this.index, newIndex);
            if (path.isEmpty()) {
            log.debug("On Way out Path is empty! Nothing to do...");
            }else {
                this.index = path.newIndex;
                this.signal.dispatch("eom", this);
                this.game.world.bringToTop(this.group);
                let speed = this.getSpeed(path.x.length);
                this.movePieceTo(path, speed);
            }
        }else{
            let path = this.movement.constructActivePath(this, newIndex);
            // Check is path received at least one movement path
            if (path.isEmpty()) {
            log.debug("Path is empty! Nothing to do...");
            }else {
                this.index = path.newIndex;
                this.signal.dispatch("eom", this);
                this.game.world.bringToTop(this.group);
                let speed = this.getSpeed(path.x.length);
                this.movePieceTo(path, speed);
            }
        }
    }

    public movePieceTo(path: Path, speed: number): void {
        let tween = this.game.add.tween(this).to(path, 1000,
        Phaser.Easing.Linear.None, true).interpolation(function(v: number[], k: number){
            return Phaser.Math.linearInterpolation(v, k);
        });
        tween.onComplete.add(this.onCompleteMovementBackToHome, this);
    }
    public onCompleteMovementBackToHome(): void {
        log.debug("My index is " + this.index + " my state is " + this.getState());
    }
    /**
     * Moves piece to homePosition
     * Sends backToHome signal to Game and Board child classes
     */
    public moveToHome(): void {
        let path = this.movement.constructOnWayOutPath(this, this.index, this.index);
        if (!path.isEmpty) {
            this.signal.dispatch("backToHome", this);
            this.index = path.newIndex;
            this.game.world.bringToTop(this.group);
            this.game.add.tween(this).to({ x: path.x, y: path.y}, 6000,
            Phaser.Easing.Linear.None, true);
        }else {
            log.debug("Path is empty.");
        }
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
    public setOnWayOut(): void {
        this.state = States.onWayOut;
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