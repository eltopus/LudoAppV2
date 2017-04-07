"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Piece = (function (_super) {
    __extends(Piece, _super);
    function Piece(game, x, y, imageId, pieceId, color) {
        _super.call(this, game, x, y, imageId);
        this.color = color;
        this.defaultX = x;
        this.defaultY = y;
        this.group = this.game.add.group();
        this.group.add(this);
    }
    return Piece;
}(Phaser.Sprite));
exports.Piece = Piece;
//# sourceMappingURL=Piece.js.map