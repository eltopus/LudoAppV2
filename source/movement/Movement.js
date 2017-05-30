"use strict";
exports.__esModule = true;
var Paths = require("../entities/Paths");
var Path_1 = require("../entities/Path");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var MoveStatus_1 = require("../enums/MoveStatus");
var log = ConfigLog4j_1.factory.getLogger("model.Movement");
var PieceMovement = (function () {
    function PieceMovement(signal) {
        this.activePath = new Paths.ActivePath();
        this.onWayOutPaths = new Paths.OnWayOutPaths();
        this.signal = signal;
    }
    PieceMovement.prototype.constructActivePath = function (piece, newIndex) {
        var currentIndex = piece.index;
        var path = new Path_1.Path();
        var finalIndex = currentIndex + newIndex;
        // log.debug("Moving to finalIndex " + finalIndex + " from: " + currentIndex);
        path = this.activePath.getPath(piece, finalIndex, path);
        // path.remainder has to be greater than zero to make this call
        if (path.moveStatus === MoveStatus_1.MoveStatus.ShouldBeExiting && path.moveRemainder > 0) {
            path = this.constructOnWayOutPath(piece, 0, path.moveRemainder, path);
        }
        return path;
    };
    PieceMovement.prototype.constructOnWayOutPath = function (piece, from, newIndex, path) {
        if (typeof path === "undefined") {
            path = new Path_1.Path();
            var finalIndex = piece.index + newIndex;
            path = this.onWayOutPaths.getPath(piece, from, finalIndex, path);
        }
        else {
            path = this.onWayOutPaths.getPath(piece, from, newIndex, path);
        }
        return path;
    };
    return PieceMovement;
}());
exports.PieceMovement = PieceMovement;
