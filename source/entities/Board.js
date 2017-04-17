"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collections = require("typescript-collections");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Board");
var Board = (function () {
    function Board(signal) {
        this.signal = signal;
        this.board = new Collections.Dictionary();
        this.signal.add(this.movement, this, 0, "eom");
    }
    return Board;
}());
exports.Board = Board;
