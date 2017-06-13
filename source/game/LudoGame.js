"use strict";
var LudoPlayer_1 = require("./LudoPlayer");
var LudoDice_1 = require("./LudoDice");
var LudoGame = (function () {
    function LudoGame(players, dice, gameId) {
        this.ludoPlayers = [];
        this.playerTurn = false;
        this.availableColors = ["RED", "BLUE", "YELLOW", "GREEN"];
        this.currrentPlayerId = "";
        this.playerId = "";
        this.inProgress = false;
        this.playerMode = null;
        this.indexTotal = 0;
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            var ludoPlayer = new LudoPlayer_1.LudoPlayer(player);
            this.ludoPlayers.push(ludoPlayer);
        }
        this.ludoDice = new LudoDice_1.LudoDice(dice);
        this.gameId = gameId;
    }
    return LudoGame;
}());
exports.LudoGame = LudoGame;
