"use strict";
var Actions_1 = require("../enums/Actions");
var Move_1 = require("./Move");
var ActiveBoard_1 = require("../entities/ActiveBoard");
var HomeBoard_1 = require("../entities/HomeBoard");
var OnWayOutBoard_1 = require("../entities/OnWayOutBoard");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.AbstractRules");
var AbstractRules = (function () {
    function AbstractRules(dice, schedule, board) {
        this.dice = dice;
        this.schedule = schedule;
        this.board = board;
        this.rulesPool = new Array();
        this.activeRulePool = new Array();
        for (var i = 0; i < 10; ++i) {
            this.rulesPool.push(new Move_1.Move());
        }
    }
    AbstractRules.prototype.getBoard = function () {
        return this.board;
    };
    AbstractRules.prototype.rolledAtLeastOneSix = function () {
        return this.dice.rolledAtLeastOneSix();
    };
    AbstractRules.prototype.rolledDoubleSix = function () {
        return this.dice.rolledDoubleSix();
    };
    AbstractRules.prototype.getDieByValue = function (value) {
        return (this.dice.getDieUniqueIdByValue(value));
    };
    AbstractRules.prototype.getNewRule = function () {
        var rule = null;
        if (this.rulesPool.length > 0) {
            rule = this.rulesPool.pop();
        }
        else {
            rule = new Move_1.Move();
            this.activeRulePool.push(rule);
        }
        return rule;
    };
    AbstractRules.prototype.showFinalResults = function () {
        if (this.board instanceof ActiveBoard_1.ActiveBoard) {
            log.debug("Active rule: " + this.activeRulePool.length + " RulePool: " + this.rulesPool.length);
        }
        else if (this.board instanceof HomeBoard_1.HomeBoard) {
            log.debug("Home rule: " + this.activeRulePool.length + " RulePool: " + this.rulesPool.length);
        }
        else if (this.board instanceof OnWayOutBoard_1.OnWayOutBoard) {
            log.debug("OnWayOut rule: " + this.activeRulePool.length + " RulePool: " + this.rulesPool.length);
        }
    };
    AbstractRules.prototype.addSpentRulesBackToPool = function (moves) {
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var move = moves_1[_i];
            this.addToRulePool(move);
        }
    };
    AbstractRules.prototype.willCrossEntryPoint = function (piece) {
        var uniqueIds = [];
        var currentIndex = piece.index;
        var destinationIndex1 = currentIndex + this.dice.dieOne.getValue();
        var destinationIndex2 = currentIndex + this.dice.dieTwo.getValue();
        var destinationIndex3 = currentIndex + this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        if (!this.dice.isDieOneConsumed() && piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex1) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (!this.dice.isDieTwoConsumed() && piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex2) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        if ((!this.dice.isDieOneConsumed() && !this.dice.isDieTwoConsumed()) &&
            piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex3) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    };
    AbstractRules.prototype.willCrossExitPoint = function (piece) {
        var uniqueIds = [];
        var diceValue = this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        var diceDistanceToExitPoint = diceValue - (piece.entryIndex - piece.index);
        if ((!this.dice.isDieOneConsumed() && !this.dice.isDieTwoConsumed()) && diceDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        if (!this.dice.isDieOneConsumed()) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (!this.dice.isDieTwoConsumed()) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    };
    AbstractRules.prototype.getHigherDieValue = function () {
        return this.dice.getHigherDieValue();
    };
    AbstractRules.prototype.getUniqueIdCollision = function (uniqueId, index) {
        var keys = this.board.board.keys();
        var id = "NOTFOUND";
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (this.board.board.getValue(key) === index && key !== uniqueId) {
                id = key.toString();
                break;
            }
        }
        return id;
    };
    AbstractRules.prototype.addToRulePool = function (move) {
        for (var i = 0, l = this.activeRulePool.length; i < l; i++) {
            if (this.activeRulePool[i] === move) {
                this.activeRulePool.splice(i, 1);
            }
        }
        move.resetRule();
        this.rulesPool.push(move);
    };
    AbstractRules.prototype.generatePieceMovement = function (dieUniqueIds, piece, state) {
        var move = this.getNewRule();
        if (dieUniqueIds.length === 2) {
            var uniqueId = dieUniqueIds[0] + "#" + dieUniqueIds[1];
            move.action = Actions_1.Actions.PLAY;
            move.diceId = uniqueId;
            move.state = state;
            move.pieceId = piece.uniqueId;
        }
        else if (dieUniqueIds.length === 1) {
            var uniqueId = dieUniqueIds[0];
            move.action = Actions_1.Actions.PLAY;
            move.diceId = uniqueId;
            move.state = state;
            move.pieceId = piece.uniqueId;
        }
        return move;
    };
    return AbstractRules;
}());
exports.AbstractRules = AbstractRules;
//# sourceMappingURL=AbstractRules.js.map