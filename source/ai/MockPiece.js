"use strict";
var States_1 = require("../enums/States");
var MockPiece = (function () {
    function MockPiece(piece) {
        this.index = piece.index;
        this.state = piece.state;
        this.startPosition = piece.startPosition;
        this.entryIndex = piece.entryIndex;
        this.color = piece.color;
        this.uniqueId = piece.uniqueId;
        this.entryIndex = piece.entryIndex;
        this.startIndex = piece.startIndex;
    }
    MockPiece.prototype.isAtHome = function () {
        return (this.state === States_1.States.AtHome);
    };
    MockPiece.prototype.isActive = function () {
        return (this.state === States_1.States.Active);
    };
    MockPiece.prototype.isOnWayOut = function () {
        return (this.state === States_1.States.onWayOut);
    };
    MockPiece.prototype.isExited = function () {
        return (this.state === States_1.States.Exited);
    };
    MockPiece.prototype.setAtHome = function () {
        this.state = States_1.States.AtHome;
        this.index = -1;
    };
    MockPiece.prototype.setActive = function () {
        this.state = States_1.States.Active;
    };
    MockPiece.prototype.setExited = function () {
        this.state = States_1.States.Exited;
    };
    MockPiece.prototype.setOnWayOut = function () {
        this.state = States_1.States.onWayOut;
    };
    MockPiece.prototype.isAtEntryPoint = function () {
        return (this.index === this.entryIndex);
    };
    return MockPiece;
}());
exports.MockPiece = MockPiece;
//# sourceMappingURL=MockPiece.js.map