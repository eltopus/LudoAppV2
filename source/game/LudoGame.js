"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LudoPlayer_1 = require("./LudoPlayer");
var LudoDice_1 = require("./LudoDice");
var LudoGame = (function () {
    function LudoGame(players, dice) {
        this.ludoPlayers = [];
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            var ludoPlayer = new LudoPlayer_1.LudoPlayer(player);
            this.ludoPlayers.push(ludoPlayer);
        }
        this.ludoDice = new LudoDice_1.LudoDice(dice);
    }
    return LudoGame;
}());
exports.LudoGame = LudoGame;
