"use strict";
exports.__esModule = true;
var EmitPiece = (function () {
    function EmitPiece() {
        this.collidingPiece = null;
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
            this.collidingPiece = piece.collidingPiece.uniqueId;
        }
    };
    return EmitPiece;
}());
exports.EmitPiece = EmitPiece;
