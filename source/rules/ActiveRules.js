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
var log = ConfigLog4j_1.factory.getLogger("model.ActiveRules");
var ActiveRules = (function (_super) {
    __extends(ActiveRules, _super);
    function ActiveRules(dice, schedule, board) {
        _super.call(this, dice, schedule, board);
        this.state = States_1.States.Active;
    }
    ActiveRules.prototype.generateMoves = function (player) {
        var moves = [];
        var activePieces = player.getActivePieces(this.board);
        for (var _i = 0, activePieces_1 = activePieces; _i < activePieces_1.length; _i++) {
            var piece = activePieces_1[_i];
            var dieUniqueIds = this.willCrossEntryPoint(piece);
            if (dieUniqueIds.length > 0) {
                var ids = this.willCrossExitPoint(piece);
                if (ids.length > 0) {
                    for (var _a = 0, ids_1 = ids; _a < ids_1.length; _a++) {
                        var id = ids_1[_a];
                        var move = this.getNewRule();
                        move.action = Actions_1.Actions.PLAY;
                        move.diceId = id;
                        move.pieceId = piece.uniqueId;
                        move.state = this.state;
                        moves.push(move);
                    }
                }
            }
            else {
                if (!this.dice.dieOne.isConsumed()) {
                    var move = this.getNewRule();
                    move.action = Actions_1.Actions.PLAY;
                    move.diceId = this.dice.dieOne.uniqueId;
                    move.pieceId = piece.uniqueId;
                    move.state = this.state;
                    moves.push(move);
                }
                if (!this.dice.dieTwo.isConsumed()) {
                    var move = this.getNewRule();
                    move.action = Actions_1.Actions.PLAY;
                    move.diceId = this.dice.dieTwo.uniqueId;
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
        return moves;
    };
    ActiveRules.prototype.generateActivePieceMovement = function (dieUniqueIds, piece) {
        return this.generatePieceMovement(dieUniqueIds, piece, this.state);
    };
    return ActiveRules;
}(AbstractRules_1.AbstractRules));
exports.ActiveRules = ActiveRules;
//# sourceMappingURL=ActiveRules.js.map