"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collections = require("typescript-collections");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Scheduler");
var Scheduler = (function () {
    function Scheduler(dice) {
        this.players = [];
        this.sequenceNumber = 0;
        this.schedule = new Collections.Queue();
        this.allPieces = new Collections.Dictionary();
        this.dice = dice;
    }
    Scheduler.prototype.getNextPlayer = function () {
        var player = this.schedule.peek();
        if (player.previousDoubleSix === false) {
            this.dice.consumeDice();
            player = this.schedule.dequeue();
            player.unselectAllPiece();
            player.turn = false;
            this.schedule.enqueue(player);
            player = this.schedule.peek();
            player.selectAllPiece();
            player.turn = true;
        }
        else {
            player.previousDoubleSix = false;
        }
        return player;
    };
    Scheduler.prototype.enqueue = function (player) {
        if (this.schedule.isEmpty()) {
            player.selectAllPiece();
            player.sequenceNumber = this.sequenceNumber;
            ++this.sequenceNumber;
            this.schedule.enqueue(player);
        }
        else {
            player.unselectAllPiece();
            player.sequenceNumber = this.sequenceNumber;
            ++this.sequenceNumber;
            this.schedule.enqueue(player);
        }
        for (var _i = 0, _a = player.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            this.allPieces.setValue(piece.uniqueId, piece);
        }
        this.players.push(player);
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
    return Scheduler;
}());
exports.Scheduler = Scheduler;
