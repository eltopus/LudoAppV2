/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {PieceInterface} from "../entities/Piece";
import {PiecePosition} from "../entities/PiecePosition";
import {PieceMovement} from "../movement/Movement";
import {States} from "../enums/States";
import {ColorType} from "../enums/ColorType";


export class MockPiece implements PieceInterface {
    public group: Phaser.Group;
    public playerId: string;
    public uniqueId: string;
    public index: number;
    public startIndex: number;
    public state: States;
    public startPosition: PiecePosition;
    public homePosition: PiecePosition;
    public movement: PieceMovement;
    public speedConstant: number;
    public signal: Phaser.Signal;
    public entryIndex: number;
    public color: ColorType;

    constructor(piece: PieceInterface) {
        this.index = piece.index;
        this.state = piece.state;
        this.startPosition = piece.startPosition;
        this.entryIndex = piece.entryIndex;
        this.color = piece.color;
        this.uniqueId = piece.uniqueId;
        this.entryIndex = piece.entryIndex;
        this.startIndex = piece.startIndex;
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
}
