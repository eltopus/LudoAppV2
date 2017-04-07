"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Preloader_1 = require("./states/Preloader");
var Game_1 = require("./states/Game");
var LudoGame = (function (_super) {
    __extends(LudoGame, _super);
    function LudoGame() {
        _super.call(this, 800, 600, Phaser.AUTO, "gameContent");
        this.state.add("Preloader", Preloader_1.Preloader, false);
        this.state.add("Game", Game_1.Game, false);
        this.state.start("Preloader");
    }
    return LudoGame;
}(Phaser.Game));
exports.LudoGame = LudoGame;
//# sourceMappingURL=main.js.map