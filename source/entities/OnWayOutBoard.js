"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Board_1 = require("./Board");
var log = ConfigLog4j_1.factory.getLogger("model.OnWayOutBoard");
/**
 * Stores the <piece.uniqueId, piece.index> of all active pieces
 */
var OnWayOutBoard = (function (_super) {
    __extends(OnWayOutBoard, _super);
    // Using MutiDictionary for both ActiveBoard and HomeBoard led to unexpected behavior
    // remove function worked for activeBoard but not for homeBoard
    function OnWayOutBoard(signal) {
        _super.call(this, signal);
    }
    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to active board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    OnWayOutBoard.prototype.addPieceToOnWayOutBoard = function (piece) {
        this.board.setValue(piece.uniqueId, piece.index);
    };
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from active board dictionary
     * @param piece
     * @return void
     */
    OnWayOutBoard.prototype.removePieceFromOnWayOutBoard = function (piece) {
        this.board.remove(piece.uniqueId);
    };
    /**
     * Returns appropriate boolean if active board contains piece.index
     * @param piece
     * @return boolean
     */
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
