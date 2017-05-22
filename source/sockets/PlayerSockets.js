"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.PlayerSockets");
var PlayerSockets = (function () {
    function PlayerSockets() {
    }
    PlayerSockets.prototype.emitRollDice = function () {
        log.debug("Emit rollDice");
    };
    PlayerSockets.prototype.emitSelectDie = function () {
        log.debug("Select Die");
    };
    PlayerSockets.prototype.emitUnselectDie = function () {
        log.debug("Unselect Die");
    };
    PlayerSockets.prototype.emitSelectPiece = function () {
        log.debug("Select piece");
    };
    PlayerSockets.prototype.emitUnselectPiece = function () {
        log.debug("Unselect Piece");
    };
    PlayerSockets.prototype.emitPlayPiece = function () {
        log.debug("Play piece");
    };
    return PlayerSockets;
}());
exports.PlayerSockets = PlayerSockets;
