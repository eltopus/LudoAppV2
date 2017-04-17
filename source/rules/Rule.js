"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Actions_1 = require("../enums/Actions");
var Rule = (function () {
    function Rule() {
        this.pieceId = " ";
        this.action = Actions_1.Actions.DO_NOTHING;
        this.pieceId = " ";
        this.playBothDice = false;
    }
    Rule.prototype.resetRule = function () {
        this.pieceId = "";
        this.action = Actions_1.Actions.DO_NOTHING;
        this.pieceId = "";
        this.playBothDice = false;
    };
    return Rule;
}());
exports.Rule = Rule;
