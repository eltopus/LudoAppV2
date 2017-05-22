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
        _this.extFrame = null;
        _this.diceArr = [5, 1, 6, 2, 0, 4];
        _this.removeLater = true;
        _this.pixels = [];
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
        _this.events.onInputDown.add(_this.selectActiveDie, _this);
        _this.consume();
        return _this;
    }
    Die.prototype.selectActiveDie = function () {
        if (this.alpha === 0.5) {
            this.alpha = 1;
        }
        else {
            this.alpha = 0.5;
        }
    };
    Die.prototype.select = function () {
        this.alpha = 0.5;
    };
    Die.prototype.unSelectActiveDie = function () {
        this.alpha = 1;
    };
    Die.prototype.isSelected = function () {
        return (!this.isConsumed() && this.alpha === 0.5);
    };
    Die.prototype.rollComplete = function () {
        var rand = Math.floor(Math.random() * 6);
        this.frame = this.diceArr[rand];
        if (this.extFrame !== null) {
            this.frame = this.extFrame;
            this.extFrame = null;
        }
        this.signal.dispatch("endOfDieRoll");
    };
    Die.prototype.roll = function (playerId, value) {
        if (this.playerId === playerId) {
            this.resetDice();
            this.animation.play(20);
        }
        else {
            log.debug("Dice PlayerId " + this.playerId + " does not match playerId: " + playerId);
        }
        if (this.removeLater && typeof value !== "undefined") {
            this.extFrame = this.getFrame(value);
            this.removeLater = false;
        }
    };
    Die.prototype.consume = function () {
        this.frame = 3;
        this.unSelectActiveDie();
    };
    Die.prototype.resetDice = function () {
        this.alpha = 1;
    };
    Die.prototype.isConsumed = function () {
        return (this.frame === 3);
    };
    Die.prototype.isSpent = function () {
        return (this.getValue() === 0);
    };
    Die.prototype.setPlayerId = function (playerId) {
        this.playerId = playerId;
    };
    Die.prototype.getPlayerId = function () {
        return this.playerId;
    };
    Die.prototype.equalsValueSix = function () {
        return (this.getValue() === 6);
    };
    Die.prototype.getFrame = function (value) {
        switch (value) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 5;
            case 4:
                return 6;
            case 5:
                return 4;
            case 6:
                return 0;
            default:
                return 8;
        }
    };
    Die.prototype.setDieFrame = function (ludoDie) {
        this.frame = ludoDie.extFrame;
        if (ludoDie.isSelected) {
            this.select();
        }
        if (ludoDie.isConsumed) {
            this.consume();
        }
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
