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
var Perimeters_1 = require("./Perimeters");
var log = ConfigLog4j_1.factory.getLogger("model.Player");
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(game, name, playerId, turn, colorTypes, signal, ludoPieces, previousDoubleSix) {
        var _this = _super.call(this, game) || this;
        _this.pieces = [];
        _this.previousDoubleSix = false;
        _this.isAI = false;
        _this.sequenceNumber = 0;
        _this.name = name;
        _this.playerId = playerId;
        _this.turn = turn;
        _this.pieces = new Array();
        _this.signal = signal;
        _this.signal.add(_this.selectCurrentPiece, _this, 0, "select");
        _this.currentSelectedPiece = null;
        _this.perimeters = new Perimeters_1.Perimeters();
        _this.colorTypes = colorTypes;
        if (typeof previousDoubleSix !== "undefined") {
            _this.previousDoubleSix = previousDoubleSix;
        }
        if (typeof ludoPieces !== "undefined" && ludoPieces !== null) {
            _this.pieces = _this.createExistingPieces(ludoPieces, _this.signal);
        }
        else {
            for (var x = 0; x < colorTypes.length; x++) {
                var playerPieces = _this.createNewPieces(colorTypes[x], playerId, _this.signal);
                for (var _i = 0, playerPieces_1 = playerPieces; _i < playerPieces_1.length; _i++) {
                    var piece = playerPieces_1[_i];
                    _this.pieces.push(piece);
                }
            }
        }
        return _this;
    }
    Player.prototype.setSelectedPieceByUniqueId = function (uniqueId) {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.uniqueId === uniqueId) {
                this.currentSelectedPiece = piece;
                this.currentSelectedPiece.select();
                break;
            }
        }
    };
    Player.prototype.roll = function (dice, value1, value2) {
        dice.roll(this.playerId, value1, value2);
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
    Player.prototype.getSampleActivePieces = function () {
        var activePieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                activePieces.push(piece);
            }
        }
        return activePieces;
    };
    Player.prototype.getFirstOccuringActivePiece = function () {
        var firstOccuringActivePiece = null;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                firstOccuringActivePiece = piece;
                break;
            }
        }
        return firstOccuringActivePiece;
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
    Player.prototype.getSampleHomePieces = function () {
        var homePieces = [];
        var color = null;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isAtHome() && piece.color !== color) {
                homePieces.push(piece);
                color = piece.color;
            }
        }
        return homePieces;
    };
    Player.prototype.getOnWayOutPieces = function (board) {
        var onWayOutPieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            var index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isOnWayOut()) {
                onWayOutPieces.push(piece);
            }
        }
        return onWayOutPieces;
    };
    Player.prototype.getPlayerOnWayOutPieces = function () {
        var onWayOutPieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isOnWayOut()) {
                onWayOutPieces.push(piece);
            }
        }
        return onWayOutPieces;
    };
    Player.prototype.getPlayerActivePieces = function () {
        var activePieces = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                activePieces.push(piece);
            }
        }
        return activePieces;
    };
    Player.prototype.selectAllPiece = function () {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            piece.alpha = 1;
        }
        this.turn = true;
    };
    Player.prototype.unselectAllPiece = function () {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            piece.alpha = 0.5;
        }
        this.turn = false;
    };
    Player.prototype.allPiecesAreAtHome = function () {
        var allPiecesAtHome = true;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (!piece.isExited() && (piece.isActive() || piece.isOnWayOut())) {
                allPiecesAtHome = false;
                break;
            }
        }
        return allPiecesAtHome;
    };
    Player.prototype.allPiecesAreOnWayOut = function () {
        var allPiecesOnWayOut = false;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (!piece.isExited() && (piece.isAtHome() || piece.isActive())) {
                allPiecesOnWayOut = true;
                break;
            }
        }
        return allPiecesOnWayOut;
    };
    Player.prototype.selectCurrentPiece = function (listener, uniqueId, playerId) {
        if (this.turn && this.playerId === playerId) {
            if (listener === "select") {
                for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
                    var piece = _a[_i];
                    if (piece.uniqueId === uniqueId) {
                        piece.select();
                        this.currentSelectedPiece = piece;
                    }
                    else {
                        piece.unselect();
                    }
                }
            }
        }
    };
    Player.prototype.pieceBelongsToMe = function (uniqueId) {
        var belongToMe = false;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.uniqueId === uniqueId) {
                belongToMe = true;
                break;
            }
        }
        return belongToMe;
    };
    Player.prototype.getPieceByUniqueId = function (uniqueId) {
        var matchingPiece = null;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.uniqueId === uniqueId) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    };
    Player.prototype.hasActivePieces = function () {
        var active = false;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                active = true;
                break;
            }
        }
        return active;
    };
    Player.prototype.hasOnWayOutPieces = function () {
        var onWayOut = false;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isOnWayOut()) {
                onWayOut = true;
                break;
            }
        }
        return onWayOut;
    };
    Player.prototype.hasHomePieces = function () {
        var home = false;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isAtHome()) {
                home = true;
                break;
            }
        }
        return home;
    };
    Player.prototype.hasExactlyOneActivePiece = function () {
        var activePieceCount = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                ++activePieceCount;
                if (activePieceCount > 1) {
                    break;
                }
            }
        }
        return (activePieceCount === 1);
    };
    Player.prototype.hasExactlyOnePieceLeft = function () {
        var pieceCount = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive() || piece.isAtHome() || piece.isOnWayOut()) {
                ++pieceCount;
                if (pieceCount > 1) {
                    break;
                }
            }
        }
        return (pieceCount === 1);
    };
    Player.prototype.printPieceCounts = function () {
        var active = this.activePieceCount();
        var home = this.homePieceCount();
        var onw = this.onwayoutCount();
        var exit = this.exitPieceCount();
        log.debug("active: " + active + " home: " + home + " onwayout: " + onw + " exit: " + exit + " length: " + this.pieces.length);
    };
    Player.prototype.homePieceCount = function () {
        var homePieceCounts = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isAtHome()) {
                ++homePieceCounts;
            }
        }
        return homePieceCounts;
    };
    Player.prototype.activePieceCount = function () {
        var activePieceCounts = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isActive()) {
                ++activePieceCounts;
            }
        }
        return activePieceCounts;
    };
    Player.prototype.onwayoutCount = function () {
        var onwayoutPieceCounts = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isOnWayOut()) {
                ++onwayoutPieceCounts;
            }
        }
        return onwayoutPieceCounts;
    };
    Player.prototype.exitPieceCount = function () {
        var exitPieceCounts = 0;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.isExited()) {
                ++exitPieceCounts;
            }
        }
        return exitPieceCounts;
    };
    Player.prototype.piecesWithinHomePerimeters = function (homePieces) {
        var piecePerimeter = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            for (var _b = 0, homePieces_1 = homePieces; _b < homePieces_1.length; _b++) {
                var homePiece = homePieces_1[_b];
                if (piece.isWithinHomePerimeters(homePiece)) {
                    var perimeter = this.perimeters.getNewPerimeter();
                    perimeter.setPerimeters(piece.index, piece.color, this.playerId);
                    piecePerimeter.push(perimeter);
                }
            }
        }
        return piecePerimeter;
    };
    Player.prototype.piecesWithinActivePerimeterss = function (activePieces) {
        var piecePerimeter = [];
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            for (var _b = 0, activePieces_1 = activePieces; _b < activePieces_1.length; _b++) {
                var activePiece = activePieces_1[_b];
                if (piece.isWithinHomePerimeters(activePiece)) {
                    piecePerimeter.push(piece.index);
                }
            }
        }
        return piecePerimeter;
    };
    Player.prototype.addPerimetersToPool = function (perimeters) {
        for (var _i = 0, perimeters_1 = perimeters; _i < perimeters_1.length; _i++) {
            var perimeter = perimeters_1[_i];
            if (perimeter.playerId === this.playerId) {
                this.perimeters.addPerimetersToPool(perimeter, this.playerId);
            }
        }
    };
    return Player;
}(PieceFactory_1.PieceFactory));
exports.Player = Player;
