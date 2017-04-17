"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rule_1 = require("./Rule");
var ActiveBoard_1 = require("../entities/ActiveBoard");
var HomeBoard_1 = require("../entities/HomeBoard");
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
            this.rulesPool.push(new Rule_1.Rule());
        }
    }
    AbstractRules.prototype.rolledAtLeastOneSix = function () {
        return (this.dice.dieOne.getValue() === 6 || this.dice.dieTwo.getValue() === 6);
    };
    AbstractRules.prototype.rolledDoubleSix = function () {
        return (this.dice.dieOne.getValue() === 6 && this.dice.dieTwo.getValue() === 6);
    };
    AbstractRules.prototype.getDieByValue = function (value) {
        return (this.dice.getDieByValue(value));
    };
    AbstractRules.prototype.getNewRule = function () {
        var rule = null;
        if (this.rulesPool.length > 0) {
            rule = this.rulesPool.pop();
        }
        else {
            rule = new Rule_1.Rule();
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
    };
    AbstractRules.prototype.addSpentRulesBackToPool = function (rules) {
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            this.addToRulePool(rule);
        }
    };
    AbstractRules.prototype.willCrossEntryPoint = function (piece) {
        var uniqueIds = [];
        var currentIndex = piece.index;
        var destinationIndex1 = currentIndex + this.dice.dieOne.getValue();
        var destinationIndex2 = currentIndex + this.dice.dieTwo.getValue();
        var destinationIndex3 = currentIndex + this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex1) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex2) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        if (piece.getEntryIndex() >= currentIndex && piece.getEntryIndex() < destinationIndex3) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    };
    AbstractRules.prototype.willCrossExitPoint = function (piece) {
        var uniqueIds = [];
        var diceValue = this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        var diceDistanceToExitPoint = diceValue - (piece.entryIndex - piece.index);
        var dieOneDistanceToExitPoint = this.dice.dieOne.getValue() - (piece.entryIndex - piece.index);
        var dieTwoDistanceToExitPoint = this.dice.dieTwo.getValue() - (piece.entryIndex - piece.index);
        log.debug("Distance: " + diceDistanceToExitPoint + " " + dieOneDistanceToExitPoint + " " + dieTwoDistanceToExitPoint);
        if (diceDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId);
        }
        if (dieOneDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieOne.uniqueId);
        }
        if (dieTwoDistanceToExitPoint < 7) {
            uniqueIds.push(this.dice.dieTwo.uniqueId);
        }
        return uniqueIds;
    };
    AbstractRules.prototype.getHigherDieValue = function () {
        return this.dice.getHigherDieValue();
    };
    AbstractRules.prototype.addToRulePool = function (rule) {
        for (var i = 0, l = this.activeRulePool.length; i < l; i++) {
            if (this.activeRulePool[i] === rule) {
                this.activeRulePool.splice(i, 1);
            }
        }
        rule.resetRule();
        this.rulesPool.push(rule);
    };
    return AbstractRules;
}());
exports.AbstractRules = AbstractRules;
