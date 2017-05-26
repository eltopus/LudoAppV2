"use strict";
var cio = require("socket.io-client");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.PlayerSockets");
var PlayerSockets = (function () {
    function PlayerSockets() {
        this.socket = cio();
        this.socket.on("connect", function () {
            log.debug("*****************************Player is connected**********************");
        });
    }
    PlayerSockets.prototype.setScheduler = function (scheduler) {
        this.scheduler = scheduler;
    };
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
    PlayerSockets.prototype.saveCreatedGameToServer = function (ludoGame, callback) {
        this.socket.emit("saveGameToServer", ludoGame, function (message) {
            callback(message);
        });
    };
    return PlayerSockets;
}());
exports.PlayerSockets = PlayerSockets;
//# sourceMappingURL=PlayerSockets.js.map