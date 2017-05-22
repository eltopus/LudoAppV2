"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Actions_1 = require("../enums/Actions");
var States_1 = require("../enums/States");
var Move = (function () {
    function Move() {
        this.action = Actions_1.Actions.DO_NOTHING;
        this.pieceId = " ";
        this.playBothDice = false;
        this.state = null;
        this.diceId = "";
        this.mockConsumeDieValueSix = false;
        this.mockDiceId = "";
    }
    Move.prototype.resetRule = function () {
        this.pieceId = "";
        this.action = Actions_1.Actions.DO_NOTHING;
        this.diceId = "";
        this.playBothDice = false;
        this.state = null;
        this.mockConsumeDieValueSix = false;
        this.mockDiceId = "";
    };
    Move.prototype.compare = function (move) {
        var match = false;
        if (move.action === this.action && move.diceId === this.diceId && move.pieceId === this.pieceId) {
            match = true;
        }
        return match;
    };
    Move.prototype.isHomeMovement = function () {
        return (this.state === States_1.States.AtHome);
    };
    Move.prototype.isActiveMovement = function () {
        return (this.state === States_1.States.Active);
    };
    Move.prototype.isOnWayOutMovement = function () {
        return (this.state === States_1.States.onWayOut);
    };
    return Move;
}());
exports.Move = Move;
