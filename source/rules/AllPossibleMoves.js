"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var States_1 = require("../enums/States");
var AllPossibleMoves = (function () {
    function AllPossibleMoves() {
    }
    AllPossibleMoves.prototype.setAllPossibleMoves = function (activeMoves, homeMoves, onWayOutMoves) {
        this.activeMoves = activeMoves;
        this.homeMoves = homeMoves;
        this.onWayOutMoves = onWayOutMoves;
    };
    AllPossibleMoves.prototype.getPieceMoves = function (states) {
        switch (states) {
            case States_1.States.Active:
                return this.activeMoves;
            case States_1.States.AtHome:
                return this.homeMoves;
            case States_1.States.onWayOut:
                return this.onWayOutMoves;
            default:
                return [];
        }
    };
    AllPossibleMoves.prototype.resetMoves = function () {
        this.activeMoves = [];
        this.homeMoves = [];
        this.onWayOutMoves = [];
    };
    AllPossibleMoves.prototype.isEmpty = function () {
        return (this.activeMoves.length === 0 && this.homeMoves.length === 0 && this.onWayOutMoves.length === 0);
    };
    AllPossibleMoves.prototype.totalNumberOfRules = function () {
        return (this.activeMoves.length + this.homeMoves.length + this.onWayOutMoves.length);
    };
    AllPossibleMoves.prototype.activeMoveContainsDieId = function (diceId) {
        var match = false;
        for (var _i = 0, _a = this.activeMoves; _i < _a.length; _i++) {
            var movement = _a[_i];
            if (movement.diceId === diceId) {
                match = true;
                break;
            }
        }
        return match;
    };
    AllPossibleMoves.prototype.getConcatenatedPossibleMoves = function () {
        var concatMoves = [];
        concatMoves = concatMoves.concat(this.activeMoves);
        concatMoves = concatMoves.concat(this.homeMoves);
        concatMoves = concatMoves.concat(this.onWayOutMoves);
        return concatMoves;
    };
    return AllPossibleMoves;
}());
exports.AllPossibleMoves = AllPossibleMoves;
//# sourceMappingURL=AllPossibleMoves.js.map