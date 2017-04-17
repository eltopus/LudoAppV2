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
var log = ConfigLog4j_1.factory.getLogger("model.ActiveRules");
var ActiveRules = (function (_super) {
    __extends(ActiveRules, _super);
    function ActiveRules(dice, schedule, board) {
        return _super.call(this, dice, schedule, board) || this;
    }
    ActiveRules.prototype.generateRules = function (player) {
        var rules = [];
        var activePieces = player.getActivePieces(this.board);
        for (var _i = 0, activePieces_1 = activePieces; _i < activePieces_1.length; _i++) {
            var piece = activePieces_1[_i];
            var dieUniqueIds = this.willCrossEntryPoint(piece);
            if (dieUniqueIds.length > 0) {
                var ids = this.willCrossExitPoint(piece);
                if (ids.length > 0) {
                    for (var _a = 0, ids_1 = ids; _a < ids_1.length; _a++) {
                        var id = ids_1[_a];
                        var rule = this.getNewRule();
                        rule.action = Actions_1.Actions.PLAY;
                        rule.diceId = id;
                        rule.pieceId = piece.uniqueId;
                        rules.push(rule);
                        log.debug("Exit crossing alert!!! Dice id " + id + " will take piece on way out piece " + piece.uniqueId);
                    }
                }
                else {
                    for (var _b = 0, dieUniqueIds_1 = dieUniqueIds; _b < dieUniqueIds_1.length; _b++) {
                        var uniqueId = dieUniqueIds_1[_b];
                        var rule = this.getNewRule();
                        rule.action = Actions_1.Actions.PLAY;
                        rule.diceId = uniqueId;
                        rule.pieceId = piece.uniqueId;
                        rules.push(rule);
                        log.debug("Dice id " + uniqueId + " will take piece on way out piece " + piece.uniqueId);
                    }
                }
            }
            else {
                log.debug("Normal play rule generated ");
                var rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.diceId = this.dice.dieOne.uniqueId;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.diceId = this.dice.dieTwo.uniqueId;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                rule = this.getNewRule();
                rule.action = Actions_1.Actions.PLAY;
                rule.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
            }
        }
        return rules;
    };
    ActiveRules.prototype.decodeRule = function (rule) {
        if (rule.action === Actions_1.Actions.DO_NOTHING) {
            return "DO NOTHING";
        }
        else if (rule.action === Actions_1.Actions.EXIT) {
            return "EXIT " + rule.pieceId;
        }
        else if (rule.action === Actions_1.Actions.PLAY) {
            return "ACTIVE PLAY " + this.dice.getDieValueByUniqueId(rule.diceId).join() + " ON " + rule.pieceId;
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
    return ActiveRules;
}(AbstractRules_1.AbstractRules));
exports.ActiveRules = ActiveRules;
