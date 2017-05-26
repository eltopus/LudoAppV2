"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Board_1 = require("./Board");
var log = ConfigLog4j_1.factory.getLogger("model.OnWayOutBoard");
var OnWayOutBoard = (function (_super) {
    __extends(OnWayOutBoard, _super);
    function OnWayOutBoard(signal) {
        _super.call(this, signal);
    }
    OnWayOutBoard.prototype.addPieceToOnWayOutBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    OnWayOutBoard.prototype.removePieceFromOnWayOutBoard = function (piece) {
        this.board.remove(piece.uniqueId);
    };
    OnWayOutBoard.prototype.movement = function (listener, piece) {
        if (listener === "exit") {
            this.board.remove(piece.uniqueId);
        }
        if (listener === "onwayout") {
            this.addPieceToOnWayOutBoard(piece);
        }
    };
    OnWayOutBoard.prototype.containsInActiveBoard = function (piece) {
        return this.board.containsKey(piece.uniqueId);
    };
    return OnWayOutBoard;
}(Board_1.Board));
exports.OnWayOutBoard = OnWayOutBoard;
//# sourceMappingURL=OnWayOutBoard.js.map