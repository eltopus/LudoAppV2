"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Preloader = (function (_super) {
    __extends(Preloader, _super);
    function Preloader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Preloader.prototype.preload = function () {
        this.load.spritesheet("red_piece", "images/red.png", 42, 42, 2);
        this.load.spritesheet("blue_piece", "images/blue.png", 42, 42, 2);
        this.load.spritesheet("green_piece", "images/green.png", 42, 42, 2);
        this.load.spritesheet("yellow_piece", "images/yellow.png", 42, 42, 2);
        this.load.spritesheet("die", "images/dice.png", 64, 64);
        this.load.image("diceBtn", "images/dicebtn.png");
        this.load.image("play", "images/playbutton.png");
        this.load.image("board", "images/board.jpg");
        this.load.image("report", "images/ireport.png");
        this.load.image("updateBtn", "images/update.png");
        this.load.json("ludoGame", "dist/ludoGame.json");
    };
    Preloader.prototype.create = function () {
        this.startGame();
    };
    Preloader.prototype.startGame = function () {
        this.game.state.start("GameSetup", true, false);
    };
    return Preloader;
}(Phaser.State));
exports.Preloader = Preloader;
//# sourceMappingURL=Preloader.js.map