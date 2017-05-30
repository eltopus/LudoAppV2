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
var States_1 = require("../enums/States");
var AbstractRules_1 = require("./AbstractRules");
var log = ConfigLog4j_1.factory.getLogger("model.OnWayOutRules");
var OnWayOutRules = (function (_super) {
    __extends(OnWayOutRules, _super);
    function OnWayOutRules(dice, schedule, board) {
        var _this = _super.call(this, dice, schedule, board) || this;
        _this.state = States_1.States.onWayOut;
        return _this;
    }
    OnWayOutRules.prototype.generateMoves = function (player) {
        var moves = [];
        var uniqueId1 = this.dice.dieOne.uniqueId;
        var uniqueId2 = this.dice.dieTwo.uniqueId;
        if (uniqueId1 === null || uniqueId2 === null) {
            log.debug("No matching uniqueIds for the values supplied!!!");
            return;
        }
        var onWayOutPieces = player.getOnWayOutPieces(this.board);
        for (var _i = 0, onWayOutPieces_1 = onWayOutPieces; _i < onWayOutPieces_1.length; _i++) {
            var piece = onWayOutPieces_1[_i];
            if (!this.dice.dieOne.isConsumed() && (this.dice.dieOne.getValue() + piece.index) <= 5) {
                var move = this.getNewRule();
                move.action = Actions_1.Actions.PLAY;
                move.diceId = uniqueId1;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
            if (!this.dice.dieTwo.isConsumed() && (this.dice.dieTwo.getValue() + piece.index) <= 5) {
                var move = this.getNewRule();
                move.action = Actions_1.Actions.PLAY;
                move.diceId = uniqueId2;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
            if (!this.dice.dieOne.isConsumed() && !this.dice.dieTwo.isConsumed() &&
                (this.dice.dieOne.getValue() + this.dice.dieTwo.getValue() + piece.index) <= 5) {
                var move = this.getNewRule();
                move.action = Actions_1.Actions.PLAY;
                move.diceId = uniqueId1 + "#" + uniqueId2;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
        }
        return moves;
    };
    OnWayOutRules.prototype.generateOnWayOutPieceMovement = function (dieUniqueIds, piece) {
        return this.generatePieceMovement(dieUniqueIds, piece, this.state);
    };
    return OnWayOutRules;
}(AbstractRules_1.AbstractRules));
exports.OnWayOutRules = OnWayOutRules;
//# sourceMappingURL=OnWayOutRules.js.map