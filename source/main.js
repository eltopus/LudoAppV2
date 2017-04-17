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
var Preloader_1 = require("./states/Preloader");
var Game_1 = require("./states/Game");
var LudoGame = (function (_super) {
    __extends(LudoGame, _super);
    function LudoGame() {
        var _this = _super.call(this, 900, 720, Phaser.AUTO, "gameContainer") || this;
        _this.state.add("Preloader", Preloader_1.Preloader, false);
        _this.state.add("Game", Game_1.Game, false);
        _this.state.start("Preloader");
        return _this;
    }
    return LudoGame;
}(Phaser.Game));
exports.LudoGame = LudoGame;
window.onload = function () {
    var game = new LudoGame();
};
