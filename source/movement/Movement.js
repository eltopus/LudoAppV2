"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Paths = require("../entities/Paths");
var Path_1 = require("../entities/Path");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var MoveStatus_1 = require("../enums/MoveStatus");
var log = ConfigLog4j_1.factory.getLogger("model.Movement");
var Move = (function () {
    function Move() {
        this.activePath = new Paths.ActivePath();
        this.homePaths = new Paths.HomePaths();
    }
    Move.prototype.constructActivePath = function (piece, newIndex) {
        var currentIndex = piece.index;
        var path = new Path_1.Path();
        var finalIndex = currentIndex + newIndex;
        path = this.activePath.getPath(piece, finalIndex, path);
        if (path.moveStatus === MoveStatus_1.MoveStatus.ShouldBeExiting && path.moveRemainder > 0) {
            path = this.constructHomePath(piece, 0, path.moveRemainder, path);
        }
        return path;
    };
    Move.prototype.constructHomePath = function (piece, from, newIndex, path) {
        if (typeof path === "undefined") {
            path = new Path_1.Path();
            log.debug("Path is not defined");
        }
        path = this.homePaths.getPath(piece, from, newIndex, path);
        return path;
    };
    return Move;
}());
exports.Move = Move;
