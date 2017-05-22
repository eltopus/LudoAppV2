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
var log = ConfigLog4j_1.factory.getLogger("model.HomeBoard");
var HomeBoard = (function (_super) {
    __extends(HomeBoard, _super);
    function HomeBoard(signal) {
        return _super.call(this, signal) || this;
    }
    HomeBoard.prototype.addPieceToHomeBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    HomeBoard.prototype.removePieceFromHomeBoard = function (piece) {
        this.board.remove(piece.uniqueId);
    };
    HomeBoard.prototype.movement = function (listener, piece) {
        if (listener === "rom") {
            if (this.board.containsKey(piece.uniqueId)) {
                this.board.remove(piece.uniqueId);
            }
        }
        if (listener === "backToHome") {
            this.board.setValue(piece.uniqueId, piece.index);
        }
    };
    HomeBoard.prototype.containsInHomeBoard = function (piece) {
        return this.board.containsKey(piece.uniqueId);
    };
    return HomeBoard;
}(Board_1.Board));
exports.HomeBoard = HomeBoard;
