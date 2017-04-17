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
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Die");
var Die = (function (_super) {
    __extends(Die, _super);
    function Die(game, x, y, imageId, uniqueId, signal) {
        var _this = _super.call(this, game, x, y, imageId) || this;
        _this.pixels = [];
        _this.diceArr = [5, 1, 6, 2, 0, 4];
        _this.uniqueId = uniqueId;
        _this.signal = signal;
        _this.playerId = null;
        _this.group = _this.game.add.group();
        _this.group.add(_this);
        _this.frame = 1;
        _this.anchor.setTo(0.5, 0.5);
        _this.inputEnabled = true;
        for (var i = 0; i < 15; i++) {
            _this.pixels[i] = _this.game.rnd.pick([0, 1, 2, 4, 5, 6]);
        }
        _this.animation = _this.animations.add("roll", _this.pixels);
        _this.animation.onComplete.add(_this.rollComplete, _this);
        return _this;
    }
    Die.prototype.rollComplete = function () {
        var rand = Math.floor(Math.random() * 6);
        this.frame = this.diceArr[rand];
        this.frame = 0;
        this.signal.dispatch("endOfDieRoll");
    };
    Die.prototype.roll = function (playerId) {
        if (this.playerId === playerId) {
            this.animation.play(20);
        }
        else {
            log.debug("Dice PlayerId " + this.playerId + " does not match playerId: " + playerId);
        }
    };
    Die.prototype.consume = function () {
        this.frame = 1;
    };
    Die.prototype.isConsume = function () {
        return (this.frame === 1);
    };
    Die.prototype.setPlayerId = function (playerId) {
        this.playerId = playerId;
    };
    Die.prototype.getPlayerId = function () {
        return this.playerId;
    };
    Die.prototype.getValue = function () {
        switch (this.frame) {
            case 0:
                return 6;
            case 1:
                return 1;
            case 2:
                return 2;
            case 4:
                return 5;
            case 5:
                return 3;
            case 6:
                return 4;
            default:
                return 0;
        }
    };
    return Die;
}(Phaser.Sprite));
exports.Die = Die;
