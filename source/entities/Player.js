"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PieceFactory_1 = require("../entities/PieceFactory");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Player");
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(game, name, playerId, turn, colorTypes, signal) {
        var _this = _super.call(this, game) || this;
        _this.pieces = [];
        _this.name = name;
        _this.playerId = playerId;
        _this.turn = turn;
        _this.pieces = new Array();
        _this.signal = signal;
        _this.signal.add(_this.selectCurrentPiece, _this, 0, "select");
        _this.currentPiece = null;
        for (var x = 0; x < colorTypes.length; x++) {
            var playerPieces = _this.getPiece(colorTypes[x], playerId, _this.signal);
            for (var _i = 0, playerPieces_1 = playerPieces; _i < playerPieces_1.length; _i++) {
                var piece = playerPieces_1[_i];
                _this.pieces.push(piece);
            }
        }
        return _this;
    }
    Player.prototype.roll = function (dice) {
        dice.roll(this.playerId);
    };
    Player.prototype.getActivePieces = function (board) {
        var activePieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            var index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isActive()) {
                activePieces.push(piece);
            }
        }
        return activePieces;
    };
    Player.prototype.getHomePieces = function (board) {
        var homePieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            var index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isAtHome()) {
                homePieces.push(piece);
            }
        }
        return homePieces;
    };
    Player.prototype.getOnWayOutPieces = function (board) {
        var onWayOutPieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            var index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.setOnWayOut()) {
                onWayOutPieces.push(piece);
            }
        }
        return onWayOutPieces;
    };
    Player.prototype.selectCurrentPiece = function (listener, uniqueId, playerId) {
        if (this.playerId === playerId) {
            if (listener === "select") {
                for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
                    var piece = _a[_i];
                    if (piece.uniqueId === uniqueId) {
                        piece.select();
                        this.currentPiece = piece;
                    }
                    else {
                        piece.unselect();
                    }
                }
            }
        }
    };
    return Player;
}(PieceFactory_1.PieceFactory));
exports.Player = Player;
