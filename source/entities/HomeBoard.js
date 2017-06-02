"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Board_1 = require("./Board");
var log = ConfigLog4j_1.factory.getLogger("model.HomeBoard");
/**
 * Stores the <piece.uniqueId, piece.index> of all home pieces
 */
var HomeBoard = (function (_super) {
    __extends(HomeBoard, _super);
    function HomeBoard(signal) {
        _super.call(this, signal);
    }
    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to home board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    HomeBoard.prototype.addPieceToHomeBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from home board dictionary
     * @param piece
     * @return void
     */
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
    /**
     * Returns appropriate boolean if home board contains piece.index
     * @param piece
     * @return boolean
     */
    HomeBoard.prototype.containsInHomeBoard = function (piece) {
        return this.board.containsKey(piece.uniqueId);
    };
    return HomeBoard;
}(Board_1.Board));
exports.HomeBoard = HomeBoard;
