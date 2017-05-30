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
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Board_1 = require("./Board");
var log = ConfigLog4j_1.factory.getLogger("model.OnWayOutBoard");
var OnWayOutBoard = (function (_super) {
    __extends(OnWayOutBoard, _super);
    function OnWayOutBoard(signal) {
        return _super.call(this, signal) || this;
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