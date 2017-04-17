"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var HomeRules_1 = require("./HomeRules");
var ActiveRules_1 = require("./ActiveRules");
var OnWayOutRules_1 = require("./OnWayOutRules");
var log = ConfigLog4j_1.factory.getLogger("model.Rules");
var Rules = (function () {
    function Rules(signal, schedule, dice, activeBoard, homeBoard) {
        this.rollCounter = 0;
        this.activeRule = new ActiveRules_1.ActiveRules(dice, schedule, activeBoard);
        this.homeRule = new HomeRules_1.HomeRules(dice, schedule, homeBoard);
        this.onWayOutRule = new OnWayOutRules_1.OnWayOutRules(dice, schedule, homeBoard);
        this.schedule = schedule;
        this.signal = signal;
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
    }
    Rules.prototype.generateRules = function (player) {
        var activeRules = this.activeRule.generateRules(player);
        var homeRules = this.homeRule.generateRules(player);
        for (var _i = 0, homeRules_1 = homeRules; _i < homeRules_1.length; _i++) {
            var rule = homeRules_1[_i];
            log.debug(this.homeRule.decodeRule(rule));
        }
        for (var _a = 0, activeRules_1 = activeRules; _a < activeRules_1.length; _a++) {
            var rule = activeRules_1[_a];
            log.debug(this.activeRule.decodeRule(rule));
        }
        this.homeRule.addSpentRulesBackToPool(homeRules);
        this.activeRule.addSpentRulesBackToPool(activeRules);
        this.activeRule.showFinalResults();
        this.homeRule.showFinalResults();
        return null;
    };
    Rules.prototype.generateOnWayOutRules = function (piece) {
        return null;
    };
    Rules.prototype.endOfDiceRoll = function (listener) {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                var player = this.schedule.getCurrentPlayer();
                this.generateRules(player);
            }
        }
    };
    return Rules;
}());
exports.Rules = Rules;
