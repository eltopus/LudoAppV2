"use strict";
var EmitPiece = (function () {
    function EmitPiece() {
        this.collidingPiece = null;
        this.movement = null;
    }
    EmitPiece.prototype.setParameters = function (piece) {
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
    };
    return EmitPiece;
}());
exports.EmitPiece = EmitPiece;
