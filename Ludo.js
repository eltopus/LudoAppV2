"use strict";
var typescript_collections_1 = require("typescript-collections");
var games = new typescript_collections_1.Dictionary();
var socket;
var io;
var Ludo = (function () {
    function Ludo() {
    }
    //
    Ludo.prototype.initLudo = function (gameio, gamesocket) {
        io = gameio;
        socket = gamesocket;
        socket.on("saveGameToServer", this.createGame);
        socket.on("rollDice", this.rollDice);
        socket.on("joinExistingGame", this.joinExistingGame);
        socket.on("connected", this.connected);
        socket.on("disconnect", function () {
            console.log("Client disconnected");
        });
    };
    Ludo.prototype.getExistingGame = function (gameId, callback) {
        var ludogame = games.getValue(gameId);
        callback(ludogame);
    };
    Ludo.prototype.createGame = function (ludogame, callback) {
        games.setValue(ludogame.gameId, ludogame);
        socket.join(ludogame.gameId);
        callback({ ok: true, message: ludogame.gameId + " was successfuly created." + socket.id, emit: true });
    };
    Ludo.prototype.joinExistingGame = function (gameId, callback) {
        var ludogame = games.getValue(gameId);
        if (ludogame) {
            console.log(ludogame.gameId + " was successfuly joined." + socket.id);
            socket.join(gameId);
            callback({ ok: true, message: ludogame.gameId + " was successfuly joined." + socket.id, emit: false });
        }
        else {
            callback({ ok: false, message: gameId + " does not exist!!!.", emit: false });
        }
    };
    Ludo.prototype.connected = function () {
        console.log("New socket connecting " + " was found " + socket.id);
    };
    Ludo.prototype.rollDice = function (dice, callback) {
        console.log("Broadcating roll dice" + socket.id);
        // socket.broadcast.to(dice.gameId).emit("emitRollDice", dice);
        io.in(dice.gameId).emit("emitRollDice", dice);
        callback(dice);
    };
    return Ludo;
}());
exports.Ludo = Ludo;
