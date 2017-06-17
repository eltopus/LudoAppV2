"use strict";
/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
var Collections = require("typescript-collections");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Board");
var Board = (function () {
    function Board(signal) {
        this.signal = signal;
        this.board = new Collections.Dictionary();
        this.signal.add(this.movement, this, 0, "startmovement");
    }
    Board.prototype.clearBoard = function () {
        this.board.clear();
    };
    return Board;
}());
exports.Board = Board;
