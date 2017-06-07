import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {PiecePosition} from "../entities/PiecePosition";
import {Piece} from "../entities/Piece";
import {Move} from "../rules/Move";

export class EmitPiece {
    public color: ColorType;
    public playerId: string;
    public uniqueId: string;
    public index: number;
    public state: States;
    public currentPosition: PiecePosition;
    public entryIndex: number;
    public collidingPiece: string = null;
    public gameId: string;
    public diceUniqueIds: string[];
    public movement: Move = null;

    public setParameters(piece: Piece) {
        this.color = piece.color;
        this.playerId = piece.playerId;
        this.uniqueId = piece.uniqueId;
        this.index = piece.index;
        this.state = piece.state;
        this.currentPosition = piece.getCurrentPiecePostionByIndex();
        this.entryIndex = piece.entryIndex;
        this.gameId = piece.gameId;
        if (piece.collidingPiece !== null) {
            this.collidingPiece = piece.collidingPiece;
        }
    }
}
