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
        socket.on("saveGameToServer", this.saveGameToServer);
        socket.on("rollDice", this.rollDice);
    };
    Ludo.prototype.saveGameToServer = function (ludogame, callback) {
        games.setValue(ludogame.gameId, ludogame);
        callback(JSON.stringify(ludogame));
    };
    Ludo.prototype.rollDice = function (dice, callback) {
        callback(JSON.stringify(dice));
    };
    return Ludo;
}());
exports.Ludo = Ludo;
