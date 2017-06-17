"use strict";
/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
var Collections = require("typescript-collections");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Emit_1 = require("../emit/Emit");
var LudoGame_1 = require("../game/LudoGame");
var checksum = require("checksum");
var log = ConfigLog4j_1.factory.getLogger("model.Scheduler");
var emit = Emit_1.Emit.getInstance();
var Scheduler = (function () {
    function Scheduler(dice, socket, signal, gameId) {
        this.players = [];
        this.schedule = new Collections.Queue();
        this.allPieces = new Collections.Dictionary();
        this.dice = dice;
        this.socket = socket;
        this.gameId = gameId;
        this.signal = signal;
    }
    Scheduler.prototype.getNextPlayer = function () {
        var player = this.schedule.peek();
        if (player.previousDoubleSix === false) {
            this.dice.consumeWithoutEmission();
            player = this.schedule.dequeue();
            player.unselectAllPiece();
            player.turn = false;
            this.schedule.enqueue(player);
            player = this.schedule.peek();
            player.selectAllPiece();
            player.turn = true;
            var currentplayer = this.players.pop();
            this.players.unshift(currentplayer);
        }
        else {
            // Returning same player. Set value back to false
            player.previousDoubleSix = false;
        }
        return player;
    };
    Scheduler.prototype.enqueue = function (player) {
        if (this.schedule.isEmpty()) {
            player.selectAllPiece();
            this.schedule.enqueue(player);
        }
        else {
            player.unselectAllPiece();
            this.schedule.enqueue(player);
        }
        for (var _i = 0, _a = player.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            this.allPieces.setValue(piece.uniqueId, piece);
        }
        this.players.push(player);
    };
    Scheduler.prototype.resetScheduler = function () {
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.resetPlayer();
        }
        this.players = [];
        this.schedule.clear();
        this.allPieces.clear();
    };
    Scheduler.prototype.getPieceByUniqueId = function (uniqueId) {
        return this.allPieces.getValue(uniqueId);
    };
    Scheduler.prototype.getCurrentPlayer = function () {
        return (this.schedule.peek());
    };
    Scheduler.prototype.getPieceOwner = function (uniqueId) {
        var owner = null;
        this.schedule.forEach(function (player) {
            if (player.pieceBelongsToMe(uniqueId)) {
                owner = player;
            }
        });
        return owner;
    };
    Scheduler.prototype.getHomeEnemyPerimeters = function () {
        var currentPlayer = this.getCurrentPlayer();
        var enemyPerimeter = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.playerId !== currentPlayer.playerId) {
                var sampleHomePieces = this.getCurrentPlayer().getSampleHomePieces();
                if (sampleHomePieces.length > 0) {
                    enemyPerimeter = player.piecesWithinHomePerimeters(sampleHomePieces);
                }
            }
        }
        return enemyPerimeter;
    };
    Scheduler.prototype.getActiveEnemyPerimeterss = function () {
        var currentPlayer = this.getCurrentPlayer();
        var enemyPerimeter = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.playerId !== currentPlayer.playerId) {
                var sampleActivePieces = this.getCurrentPlayer().getSampleActivePieces();
                if (sampleActivePieces.length > 0) {
                    enemyPerimeter = player.piecesWithinHomePerimeters(sampleActivePieces);
                }
            }
        }
        return enemyPerimeter;
    };
    Scheduler.prototype.updatePieces = function (ludopieces) {
        for (var _i = 0, ludopieces_1 = ludopieces; _i < ludopieces_1.length; _i++) {
            var ludopiece = ludopieces_1[_i];
            var piece = this.allPieces.getValue(ludopiece.uniqueId);
            if (piece && piece.isExited() === false && piece.uniqueId === ludopiece.uniqueId) {
                // log.debug("Updating..." + piece.uniqueId);
                piece.updateLudoPiece(ludopiece);
            }
        }
    };
    Scheduler.prototype.getPlayerName = function (playerId) {
        var playerName = "";
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.playerId === playerId) {
                playerName = player.playerName;
                break;
            }
        }
        return playerName;
    };
    Scheduler.prototype.addPerimetersToPool = function (perimeters, playerId) {
        if (perimeters.length > 0) {
            for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId !== playerId) {
                    player.addPerimetersToPool(perimeters);
                }
            }
        }
    };
    Scheduler.prototype.weHaveAWinningPlayer = function () {
        var winningPlayer = false;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.wins()) {
                winningPlayer = true;
                break;
            }
        }
        return winningPlayer;
    };
    Scheduler.prototype.compareCheckSum = function (check_sum_from_server) {
        var ludogame = new LudoGame_1.LudoGame(this.players, this.dice, this.gameId);
        var check_sum_from_client = "";
        for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
            var lp = _a[_i];
            check_sum_from_client = check_sum_from_client + "#" + (checksum(JSON.stringify(lp.pieces)));
        }
        if (check_sum_from_client !== check_sum_from_server) {
            log.debug("Client: " + check_sum_from_client + " NOT EQUAL Server: " + check_sum_from_server);
        }
        else {
            log.debug("Checksum is good");
        }
    };
    return Scheduler;
}());
exports.Scheduler = Scheduler;
