"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Piece_1 = require("../entities/Piece");
var ColorType_1 = require("../enums/ColorType");
var PiecePosition_1 = require("../entities/PiecePosition");
var angular2_uuid_1 = require("angular2-uuid");
var PieceFactory = (function () {
    function PieceFactory(game) {
        this.game = game;
    }
    PieceFactory.prototype.getPiece = function (colorType, playerId, signal) {
        var type = this.getImageKey(colorType);
        if (type === "red_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(49, 287);
            var redPieces = [
                new Piece_1.Piece(this.game, 118, 72, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 72, 118, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 168, 118, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 120, 168, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return redPieces;
        }
        else if (type === "blue_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(384, 48);
            var bluePieces = [
                new Piece_1.Piece(this.game, 552, 72, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 503, 118, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 600, 118, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 552, 168, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return bluePieces;
        }
        else if (type === "yellow_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(624, 385);
            var yellowPieces = [
                new Piece_1.Piece(this.game, 552, 503, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 503, 552, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 600, 552, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 552, 600, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return yellowPieces;
        }
        else if (type === "green_piece") {
            var startPosition = new PiecePosition_1.PiecePosition(287, 622);
            var greenPieces = [
                new Piece_1.Piece(this.game, 118, 503, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 72, 552, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 168, 552, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
                new Piece_1.Piece(this.game, 118, 600, type, colorType, playerId, angular2_uuid_1.UUID.UUID(), startPosition, signal),
            ];
            return greenPieces;
        }
        else {
            return [];
        }
    };
    PieceFactory.prototype.getImageKey = function (colorType) {
        switch (colorType) {
            case ColorType_1.ColorType.Red:
                return "red_piece";
            case ColorType_1.ColorType.Blue:
                return "blue_piece";
            case ColorType_1.ColorType.Green:
                return "green_piece";
            case ColorType_1.ColorType.Yellow:
                return "yellow_piece";
            default:
                return "undefined";
        }
    };
    return PieceFactory;
}());
exports.PieceFactory = PieceFactory;
