"use strict";
var Movement_1 = require("../movement/Movement");
var Path_1 = require("../entities/Path");
var AIBrainBox = (function () {
    function AIBrainBox(ruleEnforcer, signal) {
        this.ruleEnforcer = ruleEnforcer;
        this.signal = signal;
        this.movement = new Movement_1.PieceMovement(signal);
    }
    AIBrainBox.prototype.constructMockpath = function (mockPiece, index) {
        var path = new Path_1.Path();
        if (mockPiece.isAtHome() || mockPiece.isActive()) {
            path = this.movement.constructActivePath(mockPiece, index);
        }
        else if (mockPiece.isOnWayOut()) {
            path = this.movement.constructOnWayOutPath(mockPiece, mockPiece.index, index);
        }
        return path;
    };
    return AIBrainBox;
}());
exports.AIBrainBox = AIBrainBox;
