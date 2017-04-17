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
var Actions_1 = require("../enums/Actions");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var AbstractRules_1 = require("./AbstractRules");
var log = ConfigLog4j_1.factory.getLogger("model.HomeRules");
var HomeRules = (function (_super) {
    __extends(HomeRules, _super);
    function HomeRules(dice, schedule, board) {
        return _super.call(this, dice, schedule, board) || this;
    }
    HomeRules.prototype.generateRules = function (player) {
        var rules = [];
        if (this.rolledDoubleSix()) {
            var uniqueId1 = this.dice.dieOne.uniqueId;
            var uniqueId2 = this.dice.dieTwo.uniqueId;
            if (uniqueId1 === null || uniqueId2 === null) {
                log.debug("No matching uniqueIds for the values supplied!!!");
                return;
            }
            var homePieces = player.getHomePieces(this.board);
            for (var _i = 0, homePieces_1 = homePieces; _i < homePieces_1.length; _i++) {
                var piece = homePieces_1[_i];
                var rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.diceId = uniqueId1;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.diceId = uniqueId2;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
            }
        }
        else if (this.rolledAtLeastOneSix()) {
            var uniqueId = this.dice.getDieByValue(6);
            if (uniqueId === null) {
                log.debug("No matching uniqueId for the value supplied!!!");
                return;
            }
            var homePieces = player.getHomePieces(this.board);
            for (var _a = 0, homePieces_2 = homePieces; _a < homePieces_2.length; _a++) {
                var piece = homePieces_2[_a];
                var rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.playBothDice = true;
                rule.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
            }
        }
        else {
            var rule = this.getNewRule();
            rule.action = Actions_1.Actions.SKIP;
            rules.push(rule);
        }
        return rules;
    };
    HomeRules.prototype.decodeRule = function (rule) {
        if (rule.action === Actions_1.Actions.DO_NOTHING) {
            return "DO NOTHING";
        }
        else if (rule.action === Actions_1.Actions.EXIT) {
            return "EXIT " + rule.pieceId;
        }
        else if (rule.action === Actions_1.Actions.PLAY) {
            return "HOME PLAY " + this.dice.getDieValueByUniqueId(rule.diceId).join() + " ON " + rule.pieceId;
        }
        else if (rule.action === Actions_1.Actions.ROLL) {
            return "ROLL";
        }
        else if (rule.action === Actions_1.Actions.SKIP) {
            return "SKIP";
        }
        else {
            return "DO NOTHING";
        }
    };
    return HomeRules;
}(AbstractRules_1.AbstractRules));
exports.HomeRules = HomeRules;
