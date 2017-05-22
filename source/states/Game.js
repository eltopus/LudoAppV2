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
var AIPlayer_1 = require("../entities/AIPlayer");
var RegularPlayer_1 = require("../entities/RegularPlayer");
var ColorType_1 = require("../enums/ColorType");
var ActiveBoard_1 = require("../entities/ActiveBoard");
var HomeBoard_1 = require("../entities/HomeBoard");
var OnWayOutBoard_1 = require("../entities/OnWayOutBoard");
var ExitedBoard_1 = require("../entities/ExitedBoard");
var AllPossibleMoves_1 = require("../rules/AllPossibleMoves");
var Dice_1 = require("../entities/Dice");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Scheduler_1 = require("../rules/Scheduler");
var RuleEnforcer_1 = require("../rules/RuleEnforcer");
var Paths = require("../entities/Paths");
var LudoGame_1 = require("../game/LudoGame");
var log = ConfigLog4j_1.factory.getLogger("model.Game");
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ludogame = null;
        _this.players = [];
        return _this;
    }
    Game.prototype.init = function (ludogame) {
        if (ludogame) {
            this.ludogame = ludogame;
        }
    };
    Game.prototype.create = function () {
        this.add.sprite(0, 0, "board");
        var playerOnecolors = [ColorType_1.ColorType.Red, ColorType_1.ColorType.Blue];
        var playerTwocolors = [ColorType_1.ColorType.Yellow, ColorType_1.ColorType.Green];
        this.signal = new Phaser.Signal();
        var activeboard = new ActiveBoard_1.ActiveBoard(this.signal);
        var homeboard = new HomeBoard_1.HomeBoard(this.signal);
        var onWayOutBoard = new OnWayOutBoard_1.OnWayOutBoard(this.signal);
        var exitedBoard = new ExitedBoard_1.ExitedBoard(this.signal);
        var currentPossibleMovements = new AllPossibleMoves_1.AllPossibleMoves();
        var playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        var buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        var diceBtn = this.make.button(770, 440, "diceBtn", this.rollDice, this, 2, 1, 0);
        diceBtn.alpha = 0.5;
        diceBtn.scale.x = 0.2;
        diceBtn.scale.y = 0.2;
        buttonGroup.add(diceBtn);
        var reportBtn = this.make.button(730, 320, "report", this.ireport, this, 2, 1, 0);
        reportBtn.alpha = 0.5;
        reportBtn.scale.x = 0.3;
        reportBtn.scale.y = 0.3;
        buttonGroup.add(reportBtn);
        var updateBtn = this.make.button(810, 323, "updateBtn", this.saveGame, this, 2, 1, 0);
        updateBtn.alpha = 0.5;
        updateBtn.scale.x = 0.6;
        updateBtn.scale.y = 0.6;
        buttonGroup.add(updateBtn);
        this.game.stage.disableVisibilityChange = true;
        if (this.ludogame !== null && typeof this.ludogame !== "undefined") {
            var dieOneUUID = this.ludogame.ludoDice.dieOne.uniqueId;
            var dieTwoUUID = this.ludogame.ludoDice.dieTwo.uniqueId;
            this.dice = new Dice_1.Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID);
            this.dice.dieOne.setDieFrame(this.ludogame.ludoDice.dieOne);
            this.dice.dieTwo.setDieFrame(this.ludogame.ludoDice.dieTwo);
            this.scheduler = new Scheduler_1.Scheduler(this.dice);
            this.enforcer = new RuleEnforcer_1.RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard, onWayOutBoard, exitedBoard, currentPossibleMovements);
            for (var _i = 0, _a = this.ludogame.ludoPlayers; _i < _a.length; _i++) {
                var ludoPlayer = _a[_i];
                if (ludoPlayer !== null && typeof ludoPlayer !== "undefined") {
                    var player = this.createPlayer(ludoPlayer);
                    this.scheduler.enqueue(player);
                    for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                        var piece = _c[_b];
                        if (piece.isAtHome()) {
                            homeboard.addPieceToHomeBoard(piece);
                        }
                        if (piece.isActive()) {
                            activeboard.addPieceToActiveBoard(piece);
                        }
                        if (piece.isOnWayOut()) {
                            onWayOutBoard.addPieceToOnWayOutBoard(piece);
                        }
                        if (piece.isExited()) {
                            exitedBoard.addPieceToActiveBoard(piece);
                        }
                    }
                    this.players.push(player);
                }
            }
        }
        else {
            var dieOneUUID = angular2_uuid_1.UUID.UUID();
            var dieTwoUUID = angular2_uuid_1.UUID.UUID();
            this.dice = new Dice_1.Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID);
            this.scheduler = new Scheduler_1.Scheduler(this.dice);
            this.enforcer = new RuleEnforcer_1.RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard, onWayOutBoard, exitedBoard, currentPossibleMovements);
            this.playerOne = new RegularPlayer_1.RegularPlayer(this.game, "PlayerOne", angular2_uuid_1.UUID.UUID(), true, playerOnecolors, this.signal, null, this.enforcer);
            this.playerTwo = new RegularPlayer_1.RegularPlayer(this.game, "PlayerTwo", angular2_uuid_1.UUID.UUID(), false, playerTwocolors, this.signal, null, this.enforcer);
            this.scheduler.enqueue(this.playerOne);
            this.scheduler.enqueue(this.playerTwo);
            for (var _d = 0, _e = this.playerOne.pieces; _d < _e.length; _d++) {
                var piece = _e[_d];
                homeboard.addPieceToHomeBoard(piece);
            }
            for (var _f = 0, _g = this.playerTwo.pieces; _f < _g.length; _f++) {
                var piece = _g[_f];
                homeboard.addPieceToHomeBoard(piece);
            }
            this.players.push(this.playerOne);
            this.players.push(this.playerTwo);
        }
        this.dice.setDicePlayerId(this.scheduler.getCurrentPlayer().playerId);
        if (this.scheduler.getCurrentPlayer().isAI) {
            if (this.dice.bothDiceConsumed()) {
                this.signal.dispatch("aiRollDice", this.dice, this.scheduler.getCurrentPlayer().playerId);
            }
            else {
                this.enforcer.setRollCounter(1);
                this.enforcer.endOfDiceRoll("endOfDieRoll");
            }
        }
        else if (this.scheduler.getCurrentPlayer().isAI === false && this.dice.bothDiceConsumed() === false) {
            this.enforcer.setRollCounter(1);
            this.enforcer.endOfDiceRoll("endOfDieRoll");
        }
        this.enforcer.rule.checkBoardConsistencies();
    };
    Game.prototype.rollDice = function () {
        this.dice.setDicePlayerId(this.enforcer.scheduler.getCurrentPlayer().playerId);
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice, 6, 6);
    };
    Game.prototype.playDice = function () {
        var dieIds = this.dice.getSelectedDiceUniqueIds();
        var player = this.scheduler.getCurrentPlayer();
        if (player.currentSelectedPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentSelectedPiece);
        }
        else {
            log.debug("No die selected or no piece selected");
        }
    };
    Game.prototype.update = function () {
    };
    Game.prototype.setActivePieceParameters = function (piece, index, state, board) {
        var path = new Paths.ActivePath();
        var position = path.getPiecePostionByIndex(index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    };
    Game.prototype.setOnWayOutPieceParameters = function (piece, index, state, board) {
        var path = new Paths.OnWayOutPaths();
        var position = path.getPiecePostionByIndex(piece, index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    };
    Game.prototype.createPlayer = function (ludoPlayer) {
        var player = null;
        if (ludoPlayer.isAI) {
            player = new AIPlayer_1.AIPlayer(this.game, ludoPlayer.name, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes, this.signal, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }
        else {
            player = new RegularPlayer_1.RegularPlayer(this.game, ludoPlayer.name, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes, this.signal, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }
        return player;
    };
    Game.prototype.ireport = function () {
    };
    Game.prototype.saveGame = function () {
        var ludoGame = new LudoGame_1.LudoGame(this.players, this.dice);
        log.debug(JSON.stringify(ludoGame, null, "\t"));
        log.debug(JSON.stringify(ludoGame));
    };
    return Game;
}(Phaser.State));
exports.Game = Game;
