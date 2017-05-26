"use strict";
var LudoPlayer_1 = require("./LudoPlayer");
var LudoDice_1 = require("./LudoDice");
var LudoGame = (function () {
    function LudoGame(players, dice) {
        this.ludoPlayers = [];
        this.gameId = this.generateGameId(5);
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            var ludoPlayer = new LudoPlayer_1.LudoPlayer(player);
            this.ludoPlayers.push(ludoPlayer);
        }
        this.ludoDice = new LudoDice_1.LudoDice(dice);
    }
    LudoGame.prototype.generateGameId = function (length) {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    };
    return LudoGame;
}());
exports.LudoGame = LudoGame;
