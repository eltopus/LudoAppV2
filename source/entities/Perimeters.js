"use strict";
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Perimeters");
var Perimeter = (function () {
    function Perimeter() {
        this.pieceIndex = -1;
        this.pieceColor = null;
        this.playerId = "";
    }
    Perimeter.prototype.resetPerimeter = function () {
        this.pieceIndex = -1;
        this.pieceColor = null;
        this.playerId = "";
    };
    Perimeter.prototype.setPerimeters = function (pieceIndex, pieceColor, playerId) {
        this.pieceIndex = pieceIndex;
        this.pieceColor = pieceColor;
        this.playerId = playerId;
    };
    return Perimeter;
}());
exports.Perimeter = Perimeter;
var Perimeters = (function () {
    function Perimeters() {
        this.activePerimeterPool = [];
        this.perimeterPool = [];
        for (var i = 0; i < 1; i++) {
            this.perimeterPool.push(new Perimeter());
        }
    }
    Perimeters.prototype.getNewPerimeter = function () {
        var perimeter = null;
        if (this.perimeterPool.length > 0) {
            perimeter = this.perimeterPool.pop();
        }
        else {
            perimeter = new Perimeter();
            this.activePerimeterPool.push(perimeter);
        }
        return perimeter;
    };
    Perimeters.prototype.addPerimetersToPool = function (perimeter, playerId) {
        for (var i = 0, l = this.activePerimeterPool.length; i < l; i++) {
            if (this.activePerimeterPool[i] === perimeter) {
                this.activePerimeterPool.splice(i, 1);
            }
            perimeter.resetPerimeter();
            this.perimeterPool.push(perimeter);
        }
        this.showPerimeterPool(playerId);
    };
    Perimeters.prototype.showPerimeterPool = function (playerId) {
        // log.debug(playerId + " PerimeterRoolPool: " + this.perimeterPool.length + " activePerimeterPool: " + this.activePerimeterPool.length);
    };
    return Perimeters;
}());
exports.Perimeters = Perimeters;
