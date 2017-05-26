"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Preloader_1 = require("./states/Preloader");
var GameSetup_1 = require("./states/GameSetup");
var Game_1 = require("./states/Game");
var LudoGame = (function (_super) {
    __extends(LudoGame, _super);
    function LudoGame() {
        _super.call(this, 900, 720, Phaser.AUTO, "gameContainer");
        this.state.add("Preloader", Preloader_1.Preloader, false);
        this.state.add("GameSetup", GameSetup_1.GameSetup, false);
        this.state.add("Game", Game_1.Game, false);
        this.state.start("Preloader");
    }
    return LudoGame;
}(Phaser.Game));
exports.LudoGame = LudoGame;
window.onload = function () {
    var game = new LudoGame();
};
//# sourceMappingURL=main.js.map