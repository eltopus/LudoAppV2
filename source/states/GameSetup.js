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
var PlayerMode_1 = require("../enums/PlayerMode");
var NewPlayers = require("../entities/NewPlayers");
var ColorType_1 = require("../enums/ColorType");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var $ = require("jquery");
var log = ConfigLog4j_1.factory.getLogger("model.GameSetup");
var GameSetup = (function (_super) {
    __extends(GameSetup, _super);
    function GameSetup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameSetup.prototype.init = function () {
        $("#playerName").prop("disabled", true);
        $("#redBtn").prop("disabled", true);
        $("#blueBtn").prop("disabled", true);
        $("#yellowBtn").prop("disabled", true);
        $("#greenBtn").prop("disabled", true);
        $("#createBtn").prop("disabled", true);
    };
    GameSetup.prototype.create = function () {
        var _this = this;
        var newCreatedPlayers = new NewPlayers.NewPlayers();
        var colors = [];
        var enablePlayerNameBtnAndColorBtn = function () {
            $("#playerName").prop("disabled", false);
            $("#redBtn").prop("disabled", false);
            $("#blueBtn").prop("disabled", false);
            $("#yellowBtn").prop("disabled", false);
            $("#greenBtn").prop("disabled", false);
            $("#createBtn").prop("disabled", false);
        };
        $(".dropdown-menu > li").click(function () {
            var $toggle = $(this).parent().siblings(".dropdown-toggle");
            $toggle.html($(this).text() + "<span class=\"caret\"></span>");
            if ($(this).text() === "2 PLAYER vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.AiTwoPlayer;
            }
            else if ($(this).text() === "4 PLAYER vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.AiFourPlayer;
            }
            else if ($(this).text() === "2 MULTIPLAYER") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.RegularTwoPlayer;
            }
            else if ($(this).text() === "4 MULTIPLAYER") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.RegularFourPlayer;
            }
            else if ($(this).text() === "2 COMP vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.AiTwoPlayerAiVsAi;
            }
            else if ($(this).text() === "4 COMP vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode_1.PlayerMode.AiFourPlayerAiVsAi;
            }
            enablePlayerNameBtnAndColorBtn();
        });
        $("#joinGameBtn").parent().click(function () {
            var playerName = $("#joinPlayerName").val();
            var gameId = $("#gameCode").val();
            $.ajax({
                type: "POST",
                url: "join",
                data: { gameId: gameId },
                success: function (ludogame) {
                    if (ludogame) {
                        newCreatedPlayers.ludogame = ludogame;
                        newCreatedPlayers.hasSavedGame = true;
                        _this.startGame(newCreatedPlayers);
                    }
                    else {
                        Example.show("Cannot find game game!!!");
                    }
                },
                error: function () {
                    Example.show("Failed to join game!!!");
                },
            });
        });
        $("#createBtn").parent().click(function () {
            var playerName = $("#playerName").val();
            if (playerName.length === 0) {
                playerName = "DEFAULT_NAME 1";
            }
            log.debug("PlayerName: " + playerName);
            switch (newCreatedPlayers.playerMode) {
                case PlayerMode_1.PlayerMode.AiTwoPlayer: {
                    var regularPlayer = new NewPlayers.NewPlayer(playerName, [ColorType_1.ColorType.Red, ColorType_1.ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    var aiPlayer = new NewPlayers.NewPlayer("AI PLAYER", [ColorType_1.ColorType.Yellow, ColorType_1.ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer);
                    break;
                }
                case PlayerMode_1.PlayerMode.AiFourPlayer: {
                    var regularPlayer = new NewPlayers.NewPlayer(playerName, [ColorType_1.ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    var aiPlayer1 = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType_1.ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    var aiPlayer2 = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType_1.ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    var aiPlayer3 = new NewPlayers.NewPlayer("AI PLAYER 3", [ColorType_1.ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    break;
                }
                case PlayerMode_1.PlayerMode.RegularTwoPlayer: {
                    var regularPlayer1 = new NewPlayers.NewPlayer(playerName, [ColorType_1.ColorType.Red, ColorType_1.ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    var regularPlayer2 = new NewPlayers.NewPlayer("DEFAULT_NAME 2", [ColorType_1.ColorType.Yellow, ColorType_1.ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    break;
                }
                case PlayerMode_1.PlayerMode.RegularFourPlayer: {
                    var regularPlayer1 = new NewPlayers.NewPlayer(playerName, [ColorType_1.ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    var regularPlayer2 = new NewPlayers.NewPlayer("DEFAULT_NAME 2", [ColorType_1.ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    var regularPlayer3 = new NewPlayers.NewPlayer("DEFAULT_NAME 3", [ColorType_1.ColorType.Yellow], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer3);
                    var regularPlayer4 = new NewPlayers.NewPlayer("DEFAULT_NAME 4", [ColorType_1.ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer4);
                    break;
                }
                case PlayerMode_1.PlayerMode.AiTwoPlayerAiVsAi: {
                    var aiPlayer1 = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType_1.ColorType.Red, ColorType_1.ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    var aiPlayer2 = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType_1.ColorType.Yellow, ColorType_1.ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    break;
                }
                case PlayerMode_1.PlayerMode.AiFourPlayerAiVsAi: {
                    var aiPlayer1 = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType_1.ColorType.Red], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    var aiPlayer2 = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType_1.ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    var aiPlayer3 = new NewPlayers.NewPlayer("AI PLAYER 3", [ColorType_1.ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    var aiPlayer4 = new NewPlayers.NewPlayer("AI PLAYER 4", [ColorType_1.ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer4);
                    break;
                }
            }
            _this.startGame(newCreatedPlayers);
        });
    };
    GameSetup.prototype.startGame = function (newCreatedPlayers) {
        if (newCreatedPlayers.ludogame) {
            log.debug("-+++- Ludo game" + JSON.stringify(newCreatedPlayers.ludogame));
        }
        this.game.state.start("Game", true, false, newCreatedPlayers);
    };
    return GameSetup;
}(Phaser.State));
exports.GameSetup = GameSetup;
//# sourceMappingURL=GameSetup.js.map