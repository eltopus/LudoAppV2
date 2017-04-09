/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import {Piece} from "../entities/Piece";
import {ColorType} from "../enums/ColorType";
import {PiecePosition} from "../entities/PiecePosition";
import { UUID } from "angular2-uuid";

export abstract class PieceFactory {

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    public getPiece(colorType: ColorType, playerId: string): Piece[] {

        let type = this.getImageKey(colorType);
        if (type === "red_piece") {
            let startPosition = new PiecePosition(49, 287);
            let redPieces: Piece[] = [
                new Piece(this.game, 118, 72, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 72, 118, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 168, 118, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 120, 168, type, colorType, playerId, UUID.UUID(), startPosition),
            ];
            return redPieces;
        }else if (type === "blue_piece") {
            let startPosition = new PiecePosition(384, 48);
            let bluePieces: Piece[] = [
                new Piece(this.game, 552, 72, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 503, 118, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 600, 118, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 552, 168, type, colorType, playerId, UUID.UUID(), startPosition),
            ];
            return bluePieces;
        }else if (type === "yellow_piece") {
            let startPosition = new PiecePosition(624, 385);
            let yellowPieces: Piece[] = [
                new Piece(this.game, 552, 503, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 503, 552, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 600, 552, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 552, 600, type, colorType, playerId, UUID.UUID(), startPosition),
            ];
            return yellowPieces;
        }else if (type === "green_piece") {
            let startPosition = new PiecePosition(287, 622);
            let greenPieces: Piece[] = [
                new Piece(this.game, 118, 503, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 72, 552, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 168, 552, type, colorType, playerId, UUID.UUID(), startPosition),
                new Piece(this.game, 118, 600, type, colorType, playerId, UUID.UUID(), startPosition),
            ];
            return greenPieces;
        }else {
            return [];
        }

    }

    private getImageKey(colorType: ColorType): string {

        switch (colorType) {
            case ColorType.Red:
                return "red_piece";
            case ColorType.Blue:
                return "blue_piece";
            case ColorType.Green:
                return "green_piece";
            case ColorType.Yellow:
                return "yellow_piece";
            default:
                return "undefined";
        }
    }

}
