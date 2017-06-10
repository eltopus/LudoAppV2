"use strict";
var typescript_collections_1 = require("typescript-collections");
var LudoCache = (function () {
    function LudoCache() {
        this.games = new typescript_collections_1.Dictionary();
        if (LudoCache.cacheInstance) {
            throw new Error("Error: Instantiation failed: Use LudoCacheInstance.getInstance() instead of new.");
        }
        LudoCache.cacheInstance = this;
    }
    LudoCache.getInstance = function () {
        return LudoCache.cacheInstance;
    };
    LudoCache.prototype.setValue = function (key, ludogame) {
        this.games.setValue(key, ludogame);
    };
    LudoCache.prototype.getValue = function (key) {
        return (this.games.getValue(key));
    };
    LudoCache.prototype.addPlayerName = function (playerName, playerId, gameId, callback) {
        var ludogame = this.games.getValue(gameId);
        var message = playerName + " cannot be added due to errors ecountered";
        var ok = false;
        if (ludogame.gameId) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === playerId) {
                    player.playerName = playerName;
                    message = "Player name " + player.playerName + " was sucessfully added with colors " + player.colors;
                    player.isEmpty = false;
                    ok = true;
                    break;
                }
            }
        }
        callback({ ok: ok, message: message, playerName: playerName });
    };
    LudoCache.prototype.removePlayerName = function (playerId, gameId, callback) {
        var ludogame = this.games.getValue(gameId);
        var message = "Player Name  cannot be found";
        var playerName = "";
        var ok = false;
        if (ludogame.gameId) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === playerId) {
                    player.isEmpty = true;
                    message = "Player Name" + player.playerName + " was successufly removed";
                    ok = true;
                    break;
                }
            }
        }
        callback({ ok: ok, message: message, playerName: playerName });
    };
    LudoCache.prototype.gameIsFull = function (gameId) {
        var occupiedPlayerCounts = 0;
        var isFull = false;
        var ludogame = this.games.getValue(gameId);
        if (ludogame.gameId) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (!player.isEmpty) {
                    ++occupiedPlayerCounts;
                }
            }
            isFull = (occupiedPlayerCounts === ludogame.ludoPlayers.length);
        }
        return isFull;
    };
    LudoCache.prototype.deleteGame = function (gameId, callback) {
        var message = "";
        if (this.games.containsKey(gameId)) {
            this.games.remove(gameId);
            message = "GameID " + gameId + " sucessfully deleted";
        }
        else {
            message = "GameID " + gameId + " cannot be delected ";
        }
        callback(message);
    };
    LudoCache.prototype.getCacheLength = function () {
        return this.games.size();
    };
    LudoCache.cacheInstance = new LudoCache();
    return LudoCache;
}());
exports.LudoCache = LudoCache;
