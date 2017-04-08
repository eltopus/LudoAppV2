/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {ColorType} from "../enums/ColorType";

export abstract class PieceFactory {

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    public getPiece(colorType: ColorType, playerId: string): Piece[] {

        let type = this.getImageKey(colorType);
        if (type === "red_piece") {
            let redPieces = [
                new Piece(this.game, 118, 72, type, "1", colorType, playerId),
                new Piece(this.game, 72, 118, type, "2", colorType, playerId),
                new Piece(this.game, 168, 118, type, "3", colorType, playerId),
                new Piece(this.game, 120, 168, type, "4", colorType, playerId)
            ];
            return redPieces;
        }else if (type === "blue_piece") {
            let bluePieces = [
                new Piece(this.game, 552, 72, type, "5", colorType, playerId),
                new Piece(this.game, 503, 118, type, "6", colorType, playerId),
                new Piece(this.game, 600, 118, type, "7", colorType, playerId),
                new Piece(this.game, 552, 168, type, "8", colorType, playerId)
            ];
            return bluePieces;
        }else if (type === "yellow_piece") {
            let yellowPieces = [
                new Piece(this.game, 552, 503, type, "9", colorType, playerId),
                new Piece(this.game, 503, 552, type, "10", colorType, playerId),
                new Piece(this.game, 600, 552, type, "11", colorType, playerId),
                new Piece(this.game, 552, 600, type, "12", colorType, playerId)
            ];
            return yellowPieces;
        }else if (type === "green_piece") {
            let greenPieces = [
                new Piece(this.game, 118, 503, type, "13", colorType, playerId),
                new Piece(this.game, 72, 552, type, "14", colorType, playerId),
                new Piece(this.game, 168, 552, type, "15", colorType, playerId),
                new Piece(this.game, 118, 600, type, "16", colorType, playerId)
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
