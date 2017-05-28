/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
import * as fs from "fs";
import {PlayerMode} from "../enums/PlayerMode";
import * as NewPlayers from "../entities/NewPlayers";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import * as $ from "jquery";

const log = factory.getLogger("model.GameSetup");

export class GameSetup extends Phaser.State {

    public init() {
        $("#playerName").prop("disabled", true);
        $("#redBtn").prop("disabled", true);
        $("#blueBtn").prop("disabled", true);
        $("#yellowBtn").prop("disabled", true);
        $("#greenBtn").prop("disabled", true);
        $("#createBtn").prop("disabled", true);
    }


    public create() {
        let newCreatedPlayers: NewPlayers.NewPlayers = new NewPlayers.NewPlayers();
        let colors: ColorType[] = [];

        let enablePlayerNameBtnAndColorBtn = function() {
            $("#playerName").prop("disabled", false);
            $("#redBtn").prop("disabled", false);
            $("#blueBtn").prop("disabled", false);
            $("#yellowBtn").prop("disabled", false);
            $("#greenBtn").prop("disabled", false);
            $("#createBtn").prop("disabled", false);
        };

        $(".dropdown-menu > li").click(function() {
            let $toggle = $(this).parent().siblings(".dropdown-toggle");
            $toggle.html($(this).text() + "<span class=\"caret\"></span>");
            if ($(this).text() === "2 PLAYER vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode.AiTwoPlayer;
            }else if ($(this).text() === "4 PLAYER vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode.AiFourPlayer;
            }else if ($(this).text() === "2 MULTIPLAYER") {
                newCreatedPlayers.playerMode = PlayerMode.RegularTwoPlayer;
            }else if ($(this).text() === "4 MULTIPLAYER") {
                newCreatedPlayers.playerMode = PlayerMode.RegularFourPlayer;
            }else if ($(this).text() === "2 COMP vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode.AiTwoPlayerAiVsAi;
            }else if ($(this).text() === "4 COMP vs COMP") {
                newCreatedPlayers.playerMode = PlayerMode.AiFourPlayerAiVsAi;
            }
            enablePlayerNameBtnAndColorBtn();
        });

        $("#joinGameBtn").parent().click(() => {
            let playerName = $("#joinPlayerName").val();
            let  gameId = $("#gameCode").val();
            $.ajax({
			        type: "POST",
			        url: "join",
			        data: {gameId : gameId},
			        success: (ludogame) => {
			        	if (ludogame) {
			        		newCreatedPlayers.ludogame = ludogame;
                            newCreatedPlayers.hasSavedGame = true;
                            this.startGame(newCreatedPlayers);
                        }else {
                            Example.show("Cannot find game game!!!");
                        }
                    },
			        error: function(){
			            Example.show("Failed to join game!!!");
			        },
                });
            });

         $("#createBtn").parent().click(() => {
            let playerName: string = $("#playerName").val();
            if (playerName.length === 0) {
                playerName = "DEFAULT_NAME 1";
            }
            log.debug("PlayerName: " + playerName);
            switch (newCreatedPlayers.playerMode) {
                case PlayerMode.AiTwoPlayer: {
                    let regularPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer(playerName, [ColorType.Red, ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    let aiPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER", [ColorType.Yellow, ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer);
                    break;
                }
                case PlayerMode.AiFourPlayer: {
                    let regularPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer(playerName, [ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    let aiPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 3", [ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    break;
                }
                case PlayerMode.RegularTwoPlayer: {
                    let regularPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer(playerName, [ColorType.Red, ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    let regularPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("DEFAULT_NAME 2", [ColorType.Yellow, ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    break;
                }
                case PlayerMode.RegularFourPlayer: {
                    let regularPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer(playerName, [ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    let regularPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("DEFAULT_NAME 2", [ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    let regularPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("DEFAULT_NAME 3", [ColorType.Yellow], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer3);
                    let regularPlayer4: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("DEFAULT_NAME 4", [ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer4);
                    break;
                }
                case PlayerMode.AiTwoPlayerAiVsAi: {
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType.Red, ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType.Yellow, ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    break;
                }
                case PlayerMode.AiFourPlayerAiVsAi: {
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 1", [ColorType.Red], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 2", [ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    let aiPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 3", [ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    let aiPlayer4: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("AI PLAYER 4", [ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer4);
                    break;
                }
            }
            this.startGame(newCreatedPlayers);
         });

    }

    public startGame(newCreatedPlayers: NewPlayers.NewPlayers) {
        if (newCreatedPlayers.ludogame) {
            log.debug("-+++- Ludo game" + JSON.stringify(newCreatedPlayers.ludogame));
        }
        this.game.state.start("Game", true, false, newCreatedPlayers);
    }

}
