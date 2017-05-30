"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Emit_1 = require("../emit/Emit");
var log = ConfigLog4j_1.factory.getLogger("model.PlayerSockets");
var emit = Emit_1.Emit.getInstance();
var PlayerSockets = (function () {
    function PlayerSockets(socket) {
        this.socket = socket;
    }
    PlayerSockets.prototype.saveCreatedGameToServer = function (ludoGame, callback) {
        this.socket.emit("saveGameToServer", ludoGame, function (message) {
            callback(message);
        });
    };
    PlayerSockets.prototype.joinExistingGame = function (gameId, callback) {
        this.socket.emit("joinExistingGame", gameId, function (message) {
            callback(message);
        });
    };
    PlayerSockets.prototype.selectDie = function (die) {
        this.socket.emit("selectDie", die);
    };
    PlayerSockets.prototype.unselectDie = function (die) {
        this.socket.emit("unselectDie", die);
    };
    PlayerSockets.prototype.selectPiece = function (piece) {
        this.socket.emit("selectPiece", piece);
    };
    PlayerSockets.prototype.unselectPiece = function (piece) {
        this.socket.emit("unselectPiece", piece);
    };
    PlayerSockets.prototype.playPiece = function (movement) {
        this.socket.emit("playDice", movement);
    };
    return PlayerSockets;
}());
exports.PlayerSockets = PlayerSockets;
//# sourceMappingURL=PlayerSockets.js.map