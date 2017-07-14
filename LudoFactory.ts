import {LudoGame} from "./source/game/LudoGame";
import { LudoPlayer } from "./source/game/LudoPlayer";
import {PieceInterface} from "./source/entities/Piece";
import { FactoryLudoGame } from "./factory/FactoryLudoGame";

export class LudoFactory  {
    //

    /*
    public createTwoPlayerPieces(): void {
        let imageId = this.getImageKey(colorType);
        if (imageId === "red_piece") {
            let startPosition = new PiecePosition(49, 287);
            let redPieces: Piece[] = [
                new Piece(118, 72, imageId, colorType, playerId, UUID.UUID(), startPosition,  gameId),
                new Piece(72, 118, imageId, colorType, playerId, UUID.UUID(), startPosition,  gameId),
                new Piece(168, 118, imageId, colorType, playerId, UUID.UUID(), startPosition,  gameId),
                new Piece(120, 168, imageId, colorType, playerId, UUID.UUID(), startPosition, , gameId),
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
    */
}

