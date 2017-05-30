"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmitDie_1 = require("./EmitDie");
var EmitDice = (function () {
    function EmitDice() {
        this.dieOne = new EmitDie_1.EmitDie();
        this.dieTwo = new EmitDie_1.EmitDie();
        this.gameId = "";
    }
    EmitDice.prototype.setParameters = function (dice) {
        this.dieOne.setParameters(dice.dieOne);
        this.dieTwo.setParameters(dice.dieOne);
    };
    EmitDice.prototype.resetParameters = function () {
        this.dieOne.resetParameters();
        this.dieTwo.resetParameters();
    };
    return EmitDice;
}());
exports.EmitDice = EmitDice;
//# sourceMappingURL=EmitDice.js.map