"use strict";
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
        this.accelerationIndexes = [0, 5, 11, 12, 13, 18, 24, 25, 26, 31, 37, 38, 39, 44, 50, 51];
        this.indexes = [];
    }
    ActivePath.prototype.getPath = function (piece, to, path) {
        // check if piece is at home
        if (piece.isAtHome()) {
            path.x.push(piece.startPosition.x);
            path.y.push(piece.startPosition.y);
            piece.setActive();
            path.newIndex = piece.startIndex;
            this.indexes.push(piece.startIndex);
        }
        var entryPoint = piece.entryIndex;
        var from = piece.index + 1;
        // Necessary to force condition that moves piece in to entrypoint index
        if (piece.isAtEntryPoint()) {
            from = piece.index;
        }
        // alog.debug("Stepping into From: " + from + " to: " + to + " entryPoint: " + entryPoint);
        for (var i = from; i < to + 1; i++) {
            // When piece has reached entry index and needs to enter entrytpoint
            if (i < 52) {
                if (i === entryPoint) {
                    // Make sure to push entry point
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    this.indexes.push(i);
                    var remainder = (to % entryPoint);
                    // alog.debug("Remainder is " + remainder + " to  is " + to);
                    path.moveRemainder = remainder;
                    path.newIndex = entryPoint;
                    path.moveStatus = MoveStatus_1.MoveStatus.ShouldBeExiting;
                    // alog.debug("i === entryPoint " + entryPoint + " time to enter entry with " + path.moveRemainder);
                    break;
                }
                else {
                    // when a piece is somewhere between entryindex and end of active index
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    this.indexes.push(i);
                    path.newIndex = i;
                }
            }
            else if (i > 51) {
                var remainder = (to % 51);
                // hlog.debug("k > 51 " + i + " time to round robin with remainder " + remainder);
                for (var j = 0; j < remainder; j++) {
                    // alog.debug("After x " + this.x[j] + " y: " + this.y[j] + " remainder: " + remainder);
                    path.x.push(this.x[j]);
                    path.y.push(this.y[j]);
                    this.indexes.push(i);
                }
                path.newIndex = remainder - 1;
                break;
            }
        }
        // log.debug("Nothing to do.... " + path.moveRemainder);
        // hlog.debug("Path x " + path.x.join());
        // hlog.debug("Path y " + path.y.join());
        // this.removeUnnecessaryPaths(this.indexes, path);
        /*
        if (path.isEmpty() === false && path.x.length > 1 && path.y.length > 1) {
            let x: number[] = [];
            let y: number[] = [];
            x.push(path.x[0]);
            y.push(path.y[0]);
            this.indexes.shift();
            for (let index of this.indexes) {
                if (this.accelerationIndexes.indexOf(index) >= 0) {
                    hlog.debug("NecessaryIndexes " + index + " x: " + path.x[index] + " y: " + path.y[index]);
                }else {
                    hlog.debug("UnnecessaryIndexes " + index + " x: " + path.x[index] + " y: " + path.y[index]);
                }
            }
            this.indexes = [];
        }
        */
        this.indexes = [];
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
        // hlog.debug("Piece " + piece.uniqueId + " is on the way out ");
        // Different workflow depending on the states
        if (piece.isActive()) {
            // This condition should have been taken care of by the Rule.
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
                // hlog.debug("On Way Out Path x " + path.x.join() + " newIndex " + to);
                // hlog.debug("On Way Out Path y " + path.y.join() + " newIndex " + to);
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
