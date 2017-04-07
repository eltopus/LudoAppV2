"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Piece_1 = require("../entities/Piece");
var ColorType_1 = require("../enums/ColorType");
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.apply(this, arguments);
    }
    Game.prototype.create = function () {
        this.add.sprite(0, 0, "board");
        this.redPiece = new Piece_1.Piece(this.game, 20, 120, "red_piece", "xxxyyyzzz", ColorType_1.ColorType.Red);
    };
    return Game;
}(Phaser.State));
exports.Game = Game;
//# sourceMappingURL=Game.js.map