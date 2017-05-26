"use strict";
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
        this.currentPosition = piece.getCurrentPiecePostionByIndex();
        this.entryIndex = piece.entryIndex;
        this.imageId = piece.imageId;
        if (piece.collidingPiece !== null) {
            this.collidingPiece = piece.collidingPiece.uniqueId;
        }
    }
    return LudoPiece;
}());
exports.LudoPiece = LudoPiece;
