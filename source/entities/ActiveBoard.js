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
var log = ConfigLog4j_1.factory.getLogger("model.ActiveBoard");
var ActiveBoard = (function (_super) {
    __extends(ActiveBoard, _super);
    function ActiveBoard(signal) {
        return _super.call(this, signal) || this;
    }
    ActiveBoard.prototype.addPieceToActiveBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    ActiveBoard.prototype.removePieceFromActiveBoard = function (piece) {
        this.board.remove(piece.uniqueId);
    };
    ActiveBoard.prototype.movement = function (listener, piece) {
        if (listener === "startmovement" && piece.isActive()) {
            this.board.setValue(piece.uniqueId, piece.index);
        }
        if (listener === "backToHome") {
            this.board.remove(piece.uniqueId);
        }
        if (listener === "onwayout") {
            this.board.remove(piece.uniqueId);
        }
        if (listener === "exit") {
            this.board.remove(piece.uniqueId);
        }
    };
    ActiveBoard.prototype.containsInActiveBoard = function (piece) {
        return this.board.containsKey(piece.uniqueId);
    };
    return ActiveBoard;
}(Board_1.Board));
exports.ActiveBoard = ActiveBoard;
