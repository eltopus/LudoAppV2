"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var EmitDie_1 = require("../emit/EmitDie");
var Emit_1 = require("../emit/Emit");
var LocalGame_1 = require("../game/LocalGame");
var log = ConfigLog4j_1.factory.getLogger("model.Die");
var localGame = LocalGame_1.LocalGame.getInstance();
var emit = Emit_1.Emit.getInstance();
var Die = (function (_super) {
    __extends(Die, _super);
    function Die(game, x, y, imageId, uniqueId, signal, socket, gameId) {
        _super.call(this, game, x, y, imageId);
        this.extFrame = null;
        this.diceArr = [5, 1, 6, 2, 0, 4];
        this.removeLater = true;
        this.pixels = [];
        this.emitDice = new EmitDie_1.EmitDie();
        this.uniqueId = uniqueId;
        this.signal = signal;
        this.playerId = null;
        this.socket = socket;
        this.gameId = gameId;
        this.group = this.game.add.group();
        this.group.add(this);
        this.frame = 1;
        this.anchor.setTo(0.5, 0.5);
        this.inputEnabled = true;
        for (var i = 0; i < 15; i++) {
            this.pixels[i] = this.game.rnd.pick([0, 1, 2, 4, 5, 6]);
        }
        this.animation = this.animations.add("roll", this.pixels);
        this.animation.onComplete.add(this.rollComplete, this);
        this.events.onInputDown.add(this.selectActiveDie, this);
        this.emitDice.gameId = gameId;
        if (emit.getEnableSocket()) {
            this.setSocketHandlers();
        }
        this.frame = 3;
    }
    Die.prototype.selectActiveDie = function () {
        if (this.alpha === 0.5) {
            this.alpha = 1;
            if (emit.getEmit() === true) {
                this.emitDice.setParameters(this);
                this.socket.emit("unselectActiveDie", this.emitDice);
            }
            else if (emit.isSinglePlayer()) {
                this.emitDice.setParameters(this);
                localGame.unselectActiveDie(this.emitDice);
            }
        }
        else {
            this.alpha = 0.5;
            if (emit.getEmit() === true && emit.getEnableSocket()) {
                this.emitDice.setParameters(this);
                this.socket.emit("selectActiveDie", this.emitDice);
            }
            else if (emit.isSinglePlayer()) {
                this.emitDice.setParameters(this);
                localGame.selectActiveDie(this.emitDice);
            }
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
        this.frame = this.extFrame;
        this.signal.dispatch("endOfDieRoll");
    };
    Die.prototype.roll = function (value) {
        this.resetDice();
        if (value === null || typeof value === "undefined") {
            var rand = Math.floor(Math.random() * 6);
            this.extFrame = this.diceArr[rand];
            this.animation.play(20);
        }
        else {
            this.extFrame = this.getFrame(value);
            this.animation.play(20);
        }
        if (emit.getEmit() === true) {
            this.emitDice.setParameters(this);
            this.socket.emit("rollDice", this.emitDice);
        }
        else if (emit.isSinglePlayer()) {
            this.emitDice.setParameters(this);
            localGame.rollDice(this.emitDice);
        }
    };
    Die.prototype.rollEmitDie = function (emitDieOne, emitDieTwo) {
        if (emitDieOne.uniqueId === this.uniqueId) {
            this.roll(emitDieOne.dieValue);
        }
        if (emitDieTwo.uniqueId === this.uniqueId) {
            this.roll(emitDieTwo.dieValue);
        }
    };
    Die.prototype.consume = function () {
        this.frame = 3;
        if (emit.getEmit() === true) {
            this.emitDice.setParameters(this);
            this.socket.emit("consumeDie", this.emitDice);
        }
        else if (emit.isSinglePlayer()) {
            this.emitDice.setParameters(this);
            localGame.consumeDie(this.emitDice);
        }
    };
    Die.prototype.consumeWithoutEmission = function () {
        this.frame = 3;
    };
    Die.prototype.resetDice = function () {
        this.alpha = 1;
        this.visible = true;
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
    Die.prototype.resetDie = function () {
        this.consumeWithoutEmission();
        this.unSelectActiveDie();
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
            this.visible = false;
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
    Die.prototype.getFrameValue = function () {
        switch (this.extFrame) {
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
    Die.prototype.setSocketHandlers = function () {
        var _this = this;
        this.socket.on("emitSelectActiveDie", function (die) {
            if (emit.getEmit() === false && die.uniqueId === _this.uniqueId && emit.getEnableSocket() === true) {
                // log.debug("Select piece: " + die.uniqueId);
                _this.select();
            }
        });
        this.socket.on("emitUnselectActiveDie", function (die) {
            if (emit.getEmit() === false && die.uniqueId === _this.uniqueId && emit.getEnableSocket() === true) {
                // log.debug("Select piece: " + die.uniqueId);
                _this.unSelectActiveDie();
            }
        });
    };
    return Die;
}(Phaser.Sprite));
exports.Die = Die;
