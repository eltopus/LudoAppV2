"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Board_1 = require("./Board");
var log = ConfigLog4j_1.factory.getLogger("model.ActiveBoard");
var ExitedBoard = (function (_super) {
    __extends(ExitedBoard, _super);
    function ExitedBoard(signal) {
        _super.call(this, signal);
    }
    ExitedBoard.prototype.addPieceToActiveBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    ExitedBoard.prototype.removePieceFromActiveBoard = function (piece) {
        this.board.remove(piece.uniqueId);
    };
    ExitedBoard.prototype.movement = function (listener, piece) {
        if (listener === "exit") {
            this.board.setValue(piece.uniqueId, piece.index);
        }
    };
    ExitedBoard.prototype.containsInActiveBoard = function (piece) {
        return this.board.containsKey(piece.uniqueId);
    };
    return ExitedBoard;
}(Board_1.Board));
exports.ExitedBoard = ExitedBoard;
//# sourceMappingURL=ExitedBoard.js.map