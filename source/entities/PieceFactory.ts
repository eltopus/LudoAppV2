/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import {Piece} from "../entities/Piece";
import {ColorType} from "../enums/ColorType";
import {PiecePosition} from "../entities/PiecePosition";
import { UUID } from "angular2-uuid";
import {LudoPiece} from "../game/LudoPiece";

export abstract class PieceFactory {

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    public createNewPieces(colorType: ColorType, playerId: string, signal: Phaser.Signal, socket: any, gameId: string): Piece[] {

        let imageId = this.getImageKey(colorType);
        if (imageId === "red_piece") {
            let startPosition = new PiecePosition(49, 287);
            let redPieces: Piece[] = [
                new Piece(this.game, 118, 72, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 72, 118, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 168, 118, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 120, 168, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
            ];
            return redPieces;
        }else if (imageId === "blue_piece") {
            let startPosition = new PiecePosition(384, 48);
            let bluePieces: Piece[] = [
                new Piece(this.game, 552, 72, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 503, 118, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 600, 118, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 552, 168, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
            ];
            return bluePieces;
        }else if (imageId === "yellow_piece") {
            let startPosition = new PiecePosition(624, 385);
            let yellowPieces: Piece[] = [
                new Piece(this.game, 552, 503, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 503, 552, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 600, 552, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 552, 600, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
            ];
            return yellowPieces;
        }else if (imageId === "green_piece") {
            let startPosition = new PiecePosition(287, 622);
            let greenPieces: Piece[] = [
                new Piece(this.game, 118, 503, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 72, 552, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 168, 552, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
                new Piece(this.game, 118, 600, imageId, colorType, playerId, UUID.UUID(), startPosition, signal, socket, gameId),
            ];
            return greenPieces;
        }else {
            return [];
        }

    }

    public createExistingPieces(ludoPieces: LudoPiece[], signal: Phaser.Signal, socket: any, gameId: string): Piece[] {
        let pieces: Piece[] = [];
        let collidingPieces: LudoPiece[] = [];
        for (let ludoPiece of ludoPieces) {
            switch (ludoPiece.color) {
                case ColorType.Red: {
                    let redPiece = new Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId,
                    ludoPiece.uniqueId, ludoPiece.startPosition, signal, socket, gameId);
                    redPiece = this.updateRemainingPieceParameters(ludoPiece, redPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(redPiece);
                    break;
                }
                case ColorType.Blue: {
                    let bluePiece = new Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId,
                    ludoPiece.uniqueId, ludoPiece.startPosition, signal, socket, gameId);
                    bluePiece = this.updateRemainingPieceParameters(ludoPiece, bluePiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(bluePiece);
                    break;
                }
                case ColorType.Yellow: {
                    let yellowPiece = new Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId,
                    ludoPiece.uniqueId, ludoPiece.startPosition, signal, socket, gameId);
                    yellowPiece = this.updateRemainingPieceParameters(ludoPiece, yellowPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(yellowPiece);
                    break;
                }
                case ColorType.Green: {
                    let greenPiece = new Piece(this.game, ludoPiece.currentPosition.x, ludoPiece.currentPosition.y, ludoPiece.imageId, ludoPiece.color, ludoPiece.playerId,
                    ludoPiece.uniqueId, ludoPiece.startPosition, signal, socket, gameId);
                    greenPiece = this.updateRemainingPieceParameters(ludoPiece, greenPiece);
                    if (ludoPiece.collidingPiece !== null) {
                        collidingPieces.push(ludoPiece);
                    }
                    pieces.push(greenPiece);
                    break;
                }
            }
        }
        for (let ludoPiece of collidingPieces) {
            let piece = this.getMatchingPiece(ludoPiece.uniqueId, pieces);
            if (piece !== null) {
                let collidingPiece  = this.getMatchingPiece(ludoPiece.collidingPiece, pieces);
                if (collidingPiece !== null) {
                    collidingPiece.setCollisionExited();
                }
            }
        }
        return pieces;
    }

    private getMatchingPiece(uniqueId: string, pieces: Piece[]): Piece {
        let matchingPiece: Piece = null;
        for (let piece of pieces){
            if (piece.uniqueId === uniqueId) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    }

    private updateRemainingPieceParameters(ludoPiece: LudoPiece, piece: Piece): Piece {
        piece.startIndex = ludoPiece.startIndex;
        piece.entryIndex = ludoPiece.entryIndex;
        piece.state = ludoPiece.state;
        piece.index = ludoPiece.index;
        piece.homePosition = ludoPiece.homePosition;
        return piece;
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
