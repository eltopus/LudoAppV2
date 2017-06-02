"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Actions_1 = require("../enums/Actions");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var AbstractRules_1 = require("./AbstractRules");
var States_1 = require("../enums/States");
var log = ConfigLog4j_1.factory.getLogger("model.HomeRules");
var HomeRules = (function (_super) {
    __extends(HomeRules, _super);
    function HomeRules(dice, schedule, board) {
        _super.call(this, dice, schedule, board);
        this.state = States_1.States.AtHome;
    }
    HomeRules.prototype.generateMoves = function (player) {
        var moves = [];
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
                if (!this.dice.dieOne.isConsumed()) {
                    var move = this.getNewRule();
                    move.action = Actions_1.Actions.PLAY;
                    move.diceId = uniqueId1;
                    move.pieceId = piece.uniqueId;
                    move.state = this.state;
                    moves.push(move);
                }
                if (!this.dice.dieTwo.isConsumed()) {
                    var move = this.getNewRule();
                    move.action = Actions_1.Actions.PLAY;
                    move.diceId = uniqueId2;
                    move.pieceId = piece.uniqueId;
                    move.state = this.state;
                    moves.push(move);
                }
                if (!this.dice.dieOne.isConsumed() && !this.dice.dieTwo.isConsumed()) {
                    var move = this.getNewRule();
                    move.action = Actions_1.Actions.PLAY;
                    move.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                    move.pieceId = piece.uniqueId;
                    move.state = this.state;
                    moves.push(move);
                }
            }
        }
        else if (this.rolledAtLeastOneSix()) {
            var uniqueId = this.dice.getDieUniqueIdByValue(6);
            if (uniqueId === null) {
                log.debug("No matching uniqueId for the value supplied!!!");
                return;
            }
            var homePieces = player.getHomePieces(this.board);
            for (var _a = 0, homePieces_2 = homePieces; _a < homePieces_2.length; _a++) {
                var piece = homePieces_2[_a];
                if (!this.dice.dieOne.isConsumed() && !this.dice.dieTwo.isConsumed()) {
                    var move_1 = this.getNewRule();
                    move_1.action = Actions_1.Actions.PLAY;
                    move_1.playBothDice = true;
                    move_1.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                    move_1.pieceId = piece.uniqueId;
                    move_1.state = this.state;
                    moves.push(move_1);
                }
                // Play six on an home piece regardless of the value of the second die
                var move = this.getNewRule();
                move.action = Actions_1.Actions.PLAY;
                move.diceId = uniqueId;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
        }
        return moves;
    };
    HomeRules.prototype.generateHomePieceMovement = function (dieUniqueIds, piece) {
        return this.generatePieceMovement(dieUniqueIds, piece, this.state);
    };
    return HomeRules;
}(AbstractRules_1.AbstractRules));
exports.HomeRules = HomeRules;
