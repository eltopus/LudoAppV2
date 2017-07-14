import {ColorType} from "../source/enums/ColorType";
import {PiecePosition} from "../source/entities/PiecePosition";
import {States} from "../source/enums/States";

export class FactoryLudoPiece {
    public playerId: string;
    public color: ColorType;
    public uniqueId: string;
    public index: number;
    public startIndex: number;
    public state: States;
    public startPosition: PiecePosition;
    public homePosition: PiecePosition;
    public currentPosition: PiecePosition;
    public entryIndex: number;
    public collidingPiece: string = null;
    public imageId: string;

    constructor(playerId: string, color: ColorType, uniqueId: string, index: number,
     startIndex: number, state: States, startPosition: PiecePosition, currentPosition: PiecePosition,
      entryIndex: number, collidingPiece: string, imageId: string) {
        //
    }
}
