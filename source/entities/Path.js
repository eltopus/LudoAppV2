"use strict";
var MoveStatus_1 = require("../enums/MoveStatus");
var Path = (function () {
    function Path() {
        this.x = new Array();
        this.y = new Array();
        this.moveStatus = MoveStatus_1.MoveStatus.ShouldContinue;
        this.moveRemainder = 0;
        this.newIndex = -1;
    }
    Path.prototype.setPath = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Path.prototype.isEmpty = function () {
        return (this.x.length < 1 || this.y.length < 1);
    };
    return Path;
}());
exports.Path = Path;
