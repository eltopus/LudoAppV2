import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {PiecePosition} from "../entities/PiecePosition";
import {Piece} from "../entities/Piece";

export class LudoPiece {
    public color: ColorType;
    public playerId: string;
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

    public setParameters(piece: Piece) {
        this.color = piece.color;
        this.playerId = piece.playerId;
        this.uniqueId = piece.uniqueId;
        this.index = piece.index;
        this.startIndex = piece.startIndex;
        this.state = piece.state;
        this.startPosition = piece.startPosition;
        this.homePosition = piece.homePosition;
        this.currentPosition = piece.getCurrentPiecePostionByIndex();
        this.entryIndex = piece.entryIndex;
        this.imageId = piece.imageId;
        if (piece.collidingPiece !== null) {
            this.collidingPiece = piece.collidingPiece;
        }
    }
}
