"use strict";
var LudoPiece_1 = require("./LudoPiece");
var LudoPlayer = (function () {
    function LudoPlayer(player) {
        this.pieces = [];
        this.currentSelectedPiece = null;
        this.name = player.name;
        this.playerId = player.playerId;
        this.turn = player.turn;
        this.previousDoubleSix = player.previousDoubleSix;
        this.colorTypes = player.colorTypes;
        this.isAI = player.isAI;
        this.sequenceNumber = player.sequenceNumber;
        if (player.currentSelectedPiece !== null) {
            this.currentSelectedPiece = player.currentSelectedPiece.uniqueId;
        }
        this.createPieces(player.pieces);
    }
    LudoPlayer.prototype.createPieces = function (pieces) {
        for (var _i = 0, pieces_1 = pieces; _i < pieces_1.length; _i++) {
            var piece = pieces_1[_i];
            var ludoPiece = new LudoPiece_1.LudoPiece(piece);
            this.pieces.push(ludoPiece);
        }
    };
    return LudoPlayer;
}());
exports.LudoPlayer = LudoPlayer;
