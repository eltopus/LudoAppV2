"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColorType_1 = require("../enums/ColorType");
var MoveStatus_1 = require("../enums/MoveStatus");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var alog = ConfigLog4j_1.factory.getLogger("model.Paths.ActivePath");
var hlog = ConfigLog4j_1.factory.getLogger("model.Paths.OnWayOutPaths");
var PiecePosition_1 = require("./PiecePosition");
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
            path.newIndex = piece.startIndex;
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
    ActivePath.prototype.getPiecePostionByIndex = function (index) {
        if (index > 51) {
            var newIndex = index % 51;
            return new PiecePosition_1.PiecePosition(this.x[newIndex], this.y[newIndex]);
        }
        else {
            return new PiecePosition_1.PiecePosition(this.x[index], this.y[index]);
        }
    };
    return ActivePath;
}());
exports.ActivePath = ActivePath;
var OnWayOutPaths = (function () {
    function OnWayOutPaths() {
        this.red_x = [48, 96, 144, 192, 240, 288];
        this.red_y = [336, 336, 336, 336, 336, 336];
        this.blue_x = [336, 336, 336, 336, 336, 336];
        this.blue_y = [48, 96, 144, 192, 240, 288];
        this.yellow_x = [624, 576, 528, 480, 432, 384];
        this.yellow_y = [336, 336, 336, 336, 336, 336];
        this.green_x = [336, 336, 336, 336, 336, 336];
        this.green_y = [624, 572, 528, 480, 432, 384];
    }
    OnWayOutPaths.prototype.getPath = function (piece, from, to, path) {
        var pieceOnWayoutPath;
        pieceOnWayoutPath = this.getPiecePath(piece);
        var x = pieceOnWayoutPath[0];
        var y = pieceOnWayoutPath[1];
        if (piece.isActive()) {
            if (to > 6) {
                hlog.debug("to " + to + " is greater than six! Something went wrong!!!");
            }
            else {
                for (var i = from; i < to; i++) {
                    path.x.push(x[i]);
                    path.y.push(y[i]);
                }
                path.newIndex = to - 1;
                piece.index = path.newIndex;
                if (piece.index === 5) {
                    piece.setExited();
                }
                else {
                    piece.setOnWayOut();
                }
            }
        }
        else if (piece.isOnWayOut()) {
            if (to > 5) {
                hlog.debug("to " + to + " is greater than five! Something went wrong!!!");
            }
            else {
                for (var i = from; i < to + 1; i++) {
                    path.x.push(x[i]);
                    path.y.push(y[i]);
                }
                path.newIndex = to;
                if (to === 5) {
                    piece.setExited();
                }
            }
        }
        return path;
    };
    OnWayOutPaths.prototype.getPiecePostionByIndex = function (piece, newIndex) {
        var pieceOnWayoutPath;
        pieceOnWayoutPath = this.getPiecePath(piece);
        var x = pieceOnWayoutPath[0];
        var y = pieceOnWayoutPath[1];
        if (newIndex > 6) {
            hlog.debug("Error!!! Index cannot be greater than six");
            return;
        }
        else {
            return new PiecePosition_1.PiecePosition(x[newIndex], y[newIndex]);
        }
    };
    OnWayOutPaths.prototype.getPiecePath = function (piece) {
        var pieceOnWayoutPath;
        switch (piece.color) {
            case ColorType_1.ColorType.Red:
                pieceOnWayoutPath = [this.red_x, this.red_y];
                break;
            case ColorType_1.ColorType.Blue:
                pieceOnWayoutPath = [this.blue_x, this.blue_y];
                break;
            case ColorType_1.ColorType.Yellow:
                pieceOnWayoutPath = [this.yellow_x, this.yellow_y];
                break;
            case ColorType_1.ColorType.Green:
                pieceOnWayoutPath = [this.green_x, this.green_y];
                break;
            default:
                break;
        }
        return pieceOnWayoutPath;
    };
    return OnWayOutPaths;
}());
exports.OnWayOutPaths = OnWayOutPaths;
