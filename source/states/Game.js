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
var angular2_uuid_1 = require("angular2-uuid");
var Player_1 = require("../entities/Player");
var ColorType_1 = require("../enums/ColorType");
var ActiveBoard_1 = require("../entities/ActiveBoard");
var HomeBoard_1 = require("../entities/HomeBoard");
var Dice_1 = require("../entities/Dice");
var Rules_1 = require("../rules/Rules");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Scheduler_1 = require("../rules/Scheduler");
var log = ConfigLog4j_1.factory.getLogger("model.Game");
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Game.prototype.create = function () {
        this.add.sprite(0, 0, "board");
        var playerOnecolors = [ColorType_1.ColorType.Red, ColorType_1.ColorType.Blue];
        var playerTwocolors = [ColorType_1.ColorType.Green, ColorType_1.ColorType.Yellow];
        var signal = new Phaser.Signal();
        var activeboard = new ActiveBoard_1.ActiveBoard(signal);
        var homeboard = new HomeBoard_1.HomeBoard(signal);
        this.playerOne = new Player_1.Player(this.game, "PlayerOne", angular2_uuid_1.UUID.UUID(), true, playerOnecolors, signal);
        this.playerTwo = new Player_1.Player(this.game, "PlayerTwo", angular2_uuid_1.UUID.UUID(), false, playerTwocolors, signal);
        this.schedule = new Scheduler_1.Scheduler();
        this.schedule.schedule.enqueue(this.playerOne);
        this.schedule.schedule.enqueue(this.playerTwo);
        var playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        var buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        var diceBtn = this.make.button(770, 440, "diceBtn", this.rollDice, this, 2, 1, 0);
        diceBtn.alpha = 0.5;
        diceBtn.scale.x = 0.2;
        diceBtn.scale.y = 0.2;
        buttonGroup.add(diceBtn);
        this.game.stage.disableVisibilityChange = true;
        this.dice = new Dice_1.Dice(this.game, "die", signal);
        var rule = new Rules_1.Rules(signal, this.schedule, this.dice, activeboard, homeboard);
        for (var _i = 0, _a = this.playerOne.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            homeboard.addPieceToHomeBoard(piece);
        }
        for (var _b = 0, _c = this.playerTwo.pieces; _b < _c.length; _b++) {
            var piece = _c[_b];
            homeboard.addPieceToHomeBoard(piece);
        }
    };
    Game.prototype.rollDice = function () {
        this.dice.setDicePlayerId(this.playerOne.playerId);
        this.playerOne.roll(this.dice);
    };
    Game.prototype.playDice = function () {
        var dice = this.dice.dieOne.getValue() + this.dice.dieTwo.getValue();
        if (this.playerOne.currentPiece !== null) {
            this.playerOne.currentPiece.movePiece(dice);
        }
        if (this.playerTwo.currentPiece !== null) {
            this.playerTwo.currentPiece.movePiece(dice);
        }
    };
    return Game;
}(Phaser.State));
exports.Game = Game;
