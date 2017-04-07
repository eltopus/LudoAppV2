"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Preloader = (function (_super) {
    __extends(Preloader, _super);
    function Preloader() {
        _super.apply(this, arguments);
    }
    Preloader.prototype.preload = function () {
        this.load.spritesheet("red_piece", "images/red.png", 42, 82, 2);
        this.load.spritesheet("blue_piece", "images/blue.png", 42, 92, 2);
        this.load.spritesheet("green_piece", "images/green.png", 42, 102, 2);
        this.load.spritesheet("yellow_piece", "images/yellow.png", 42, 142, 2);
        this.load.image("board", "images/board.jpg");
    };
    Preloader.prototype.create = function () {
        this.startGame();
    };
    Preloader.prototype.startGame = function () {
        this.game.state.start("Game", true, false);
    };
    return Preloader;
}(Phaser.State));
exports.Preloader = Preloader;
//# sourceMappingURL=Preloader.js.map