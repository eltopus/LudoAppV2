"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColorType_1 = require("../enums/ColorType");
var MoveStatus_1 = require("../enums/MoveStatus");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var alog = ConfigLog4j_1.factory.getLogger("model.Paths.ActivePath");
var hlog = ConfigLog4j_1.factory.getLogger("model.Paths.HomePath");
var ActivePath = (function () {
    function ActivePath() {
        this.x = [
            0, 48, 96, 144, 192, 240, 288, 288, 288, 288,
            288, 288, 336, 384, 384, 384, 384, 384, 384, 432,
            480, 528, 576, 624, 672, 672, 672, 624, 576, 528,
            480, 432, 384, 384, 384, 384, 384, 384, 336, 288,
            288, 288, 288, 288, 288, 240, 192, 144, 96, 48,
            0, 0, 0,
        ];
        this.y = [
            288, 288, 288, 288, 288, 288, 237, 189.6, 142.2, 94.8,
            47.4, 0, 0, 0, 48, 95, 142.5, 190, 237.5, 288,
            288, 288, 288, 288, 288, 336, 384, 384, 384, 384,
            384, 384, 432, 480, 528, 576, 624, 672, 672, 672,
            624, 576, 528, 480, 432, 384, 384, 384, 384, 384,
            384, 336, 285,
        ];
    }
    ActivePath.prototype.getPath = function (piece, to, path) {
        if (piece.isAtHome()) {
            path.x.push(piece.startPosition.x);
            path.y.push(piece.startPosition.y);
            piece.setActive();
        }
        var entryPoint = piece.entryIndex;
        var from = piece.index + 1;
        if (piece.isAtEntryPoint()) {
            from = piece.index;
        }
        for (var i = from; i < to + 1; i++) {
            if (i < 52) {
                if (i === entryPoint) {
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    var remainder = (to % entryPoint);
                    path.moveRemainder = remainder;
                    path.newIndex = entryPoint;
                    path.moveStatus = MoveStatus_1.MoveStatus.ShouldBeExiting;
                    alog.debug("i === entryPoint " + entryPoint + " time to enter entry with " + path.moveRemainder);
                    break;
                }
                else {
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    path.newIndex = i;
                }
            }
            else if (i > 51) {
                var remainder = (to % 51);
                for (var j = 0; j < remainder; j++) {
                    path.x.push(this.x[j]);
                    path.y.push(this.y[j]);
                }
                path.newIndex = remainder - 1;
                break;
            }
        }
        return path;
    };
    return ActivePath;
}());
exports.ActivePath = ActivePath;
var HomePaths = (function () {
    function HomePaths() {
        this.red_x = [48, 96, 144, 192, 240, 288];
        this.red_y = [336, 336, 336, 336, 336, 336];
        this.blue_x = [336, 336, 336, 336, 336, 336];
        this.blue_y = [48, 96, 144, 192, 240, 288];
        this.yellow_x = [624, 576, 528, 480, 432, 384];
        this.yellow_y = [336, 336, 336, 336, 336, 336];
        this.green_x = [336, 336, 336, 336, 336, 336];
        this.green_y = [624, 572, 528, 480, 432, 384];
    }
    HomePaths.prototype.getPath = function (piece, from, to, path) {
        var x = [];
        var y = [];
        hlog.debug("Piece " + piece.uniqueId + " is on the way out ");
        switch (piece.color) {
            case ColorType_1.ColorType.Red:
                x = this.red_x;
                y = this.red_y;
                break;
            case ColorType_1.ColorType.Blue:
                x = this.blue_x;
                y = this.blue_y;
                break;
            case ColorType_1.ColorType.Yellow:
                x = this.yellow_x;
                y = this.yellow_y;
                break;
            case ColorType_1.ColorType.Green:
                x = this.green_x;
                y = this.green_y;
                break;
            default:
                break;
        }
        if (to > 6) {
            hlog.debug("to " + to + " is greater than six! Something went wrong!!!");
            to = 6;
        }
        for (var i = from; i < to; i++) {
            path.x.push(x[i]);
            path.y.push(y[i]);
        }
        path.newIndex = to - 1;
        piece.setOnWayOut();
        return path;
    };
    return HomePaths;
}());
exports.HomePaths = HomePaths;
