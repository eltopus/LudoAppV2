"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var angular2_uuid_1 = require("angular2-uuid");
var AIPlayer_1 = require("../entities/AIPlayer");
var RegularPlayer_1 = require("../entities/RegularPlayer");
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
var PlayerSockets_1 = require("../sockets/PlayerSockets");
var log = ConfigLog4j_1.factory.getLogger("model.Game");
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.apply(this, arguments);
        this.players = [];
    }
    Game.prototype.init = function (newPlayers) {
        this.newPlayers = newPlayers;
        this.sockets = new PlayerSockets_1.PlayerSockets();
    };
    Game.prototype.create = function () {
        this.add.sprite(0, 0, "board");
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
        var reportBtn = this.make.button(730, 320, "report", this.fullScreen, this, 2, 1, 0);
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
        if (this.newPlayers.hasSavedGame) {
            var dieOneUUID = this.newPlayers.ludogame.ludoDice.dieOne.uniqueId;
            var dieTwoUUID = this.newPlayers.ludogame.ludoDice.dieTwo.uniqueId;
            this.dice = new Dice_1.Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID);
            this.dice.dieOne.setDieFrame(this.newPlayers.ludogame.ludoDice.dieOne);
            this.dice.dieTwo.setDieFrame(this.newPlayers.ludogame.ludoDice.dieTwo);
            this.scheduler = new Scheduler_1.Scheduler(this.dice);
            this.sockets.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer_1.RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard, onWayOutBoard, exitedBoard, currentPossibleMovements);
            for (var _i = 0, _a = this.newPlayers.ludogame.ludoPlayers; _i < _a.length; _i++) {
                var ludoPlayer = _a[_i];
                if (ludoPlayer !== null && typeof ludoPlayer !== "undefined") {
                    var player = this.createExistingPlayer(ludoPlayer);
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
                            piece.setExitedWithoutDispatch();
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
            this.sockets.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer_1.RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard, onWayOutBoard, exitedBoard, currentPossibleMovements);
            var players = this.createNewPlayers(this.newPlayers);
            for (var _d = 0, players_1 = players; _d < players_1.length; _d++) {
                var player = players_1[_d];
                this.scheduler.enqueue(player);
                this.players.push(player);
                for (var _e = 0, _f = player.pieces; _e < _f.length; _e++) {
                    var piece = _f[_e];
                    homeboard.addPieceToHomeBoard(piece);
                }
            }
            this.createAndPersistGame();
        }
        this.waitUntilGameStarts();
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
    Game.prototype.createExistingPlayer = function (ludoPlayer) {
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
    Game.prototype.waitUntilGameStarts = function () {
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
    Game.prototype.ireport = function () {
    };
    Game.prototype.saveGame = function () {
        var ludoGame = new LudoGame_1.LudoGame(this.players, this.dice);
        log.debug(JSON.stringify(ludoGame, null, "\t"));
        log.debug(JSON.stringify(ludoGame));
    };
    Game.prototype.createAndPersistGame = function () {
        var ludoGame = new LudoGame_1.LudoGame(this.players, this.dice);
        this.sockets.saveCreatedGameToServer(ludoGame, function (message) {
            log.debug(message);
        });
    };
    Game.prototype.createNewPlayers = function (newPlayers) {
        var players = [];
        for (var _i = 0, _a = newPlayers.newPlayers; _i < _a.length; _i++) {
            var newPlayer = _a[_i];
            if (newPlayer.isAI) {
                var aiPlayer = new AIPlayer_1.AIPlayer(this.game, newPlayer.playerName, angular2_uuid_1.UUID.UUID(), true, newPlayer.color, this.signal, null, this.enforcer);
                players.push(aiPlayer);
            }
            else {
                var regularPlayer = new RegularPlayer_1.RegularPlayer(this.game, newPlayer.playerName, angular2_uuid_1.UUID.UUID(), true, newPlayer.color, this.signal, null, this.enforcer);
                players.push(regularPlayer);
            }
        }
        return players;
    };
    Game.prototype.fullScreen = function () {
        if (this.scale.isFullScreen) {
            this.scale.stopFullScreen();
        }
        else {
            this.scale.startFullScreen(false);
        }
    };
    return Game;
}(Phaser.State));
exports.Game = Game;
//# sourceMappingURL=Game.js.map