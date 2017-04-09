/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";

export interface PieceMovement {
    movePiece(piece: Piece, to: number): void;
}

export class Move implements PieceMovement {

    public movePiece(piece: Piece, to: number): void {

    }
}