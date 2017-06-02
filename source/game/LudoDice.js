"use strict";
var LudoDie_1 = require("./LudoDie");
var LudoDice = (function () {
    function LudoDice(dice) {
        this.dieOne = new LudoDie_1.LudoDie(dice.dieOne);
        this.dieTwo = new LudoDie_1.LudoDie(dice.dieTwo);
    }
    return LudoDice;
}());
exports.LudoDice = LudoDice;
