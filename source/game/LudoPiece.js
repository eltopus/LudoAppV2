"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PiecePosition_1 = require("../entities/PiecePosition");
var LudoPiece = (function () {
    function LudoPiece(piece) {
        this.collidingPiece = null;
        this.color = piece.color;
        this.playerId = piece.playerId;
        this.uniqueId = piece.uniqueId;
        this.index = piece.index;
        this.startIndex = piece.startIndex;
        this.state = piece.state;
        this.startPosition = piece.startPosition;
        this.homePosition = piece.homePosition;
        this.currentPosition = new PiecePosition_1.PiecePosition(piece.x, piece.y);
        this.entryIndex = piece.entryIndex;
        this.imageId = piece.imageId;
        if (piece.collidingPiece !== null) {
            this.collidingPiece = piece.collidingPiece.uniqueId;
        }
    }
    return LudoPiece;
}());
exports.LudoPiece = LudoPiece;
