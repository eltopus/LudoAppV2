"use strict";
var EmitDie = (function () {
    function EmitDie() {
    }
    EmitDie.prototype.setParameters = function (die) {
        this.uniqueId = die.uniqueId;
        this.playerId = die.playerId;
        this.extFrame = die.getFrame(die.getValue());
        this.dieValue = die.getValue();
        this.isSelected = die.isSelected();
        this.isConsumed = die.isConsumed();
        this.gameId = die.gameId;
    };
    EmitDie.prototype.resetParameters = function () {
        this.uniqueId = null;
        this.playerId = null;
        this.extFrame = null;
        this.dieValue = null;
        this.isSelected = null;
        this.isConsumed = null;
    };
    return EmitDie;
}());
exports.EmitDie = EmitDie;
