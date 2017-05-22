"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LudoDie = (function () {
    function LudoDie(die) {
        this.uniqueId = die.uniqueId;
        this.playerId = die.playerId;
        this.extFrame = die.getFrame(die.getValue());
        this.dieValue = die.getValue();
        this.isSelected = die.isSelected();
        this.isConsumed = die.isConsumed();
    }
    return LudoDie;
}());
exports.LudoDie = LudoDie;
