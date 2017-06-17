/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
import * as fs from "fs";
import {PlayerMode} from "../enums/PlayerMode";
import * as NewPlayers from "../entities/NewPlayers";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import * as $ from "jquery";
import {Emit} from "../emit/Emit";

let emit = Emit.getInstance();
const log = factory.getLogger("model.GameSetup");
let newCreatedPlayers: NewPlayers.NewPlayers = new NewPlayers.NewPlayers();
let Display: any = Example;
let signal = new Phaser.Signal();
let creator = false;
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
            let playerName: string = $("#joinPlayerName").val().trim().toUpperCase();
            let  gameId: string = $("#gameCode").val().trim();
            if (playerName.length === 0) {
                playerName = "_NAME 1";
            }
            $.ajax({
			        type: "POST",
			        url: "join",
			        // tslint:disable-next-line:object-literal-sort-keys
			        data: {gameId : gameId.toLowerCase(), playerName: playerName},
			        success: (ludogame: any) => {
                        // Expecting callback({ok: ok, updatedludogame: updatedludogame, message: message});
			        	if (ludogame.ok === true || ludogame.admin === true) {
			        		newCreatedPlayers.ludogame = ludogame.updatedludogame;
                            newCreatedPlayers.hasSavedGame = true;
                            emit.setCurrentPlayerId(ludogame.updatedludogame.playerId);
                            if (ludogame.admin === true) {
                                Display.show("Message: " + ludogame.message);
                            }
                            this.startGame();
                        }else {
                            if (ludogame.availablePlayerNames.length > 0) {
                                Display.show("Message: " + ludogame.availablePlayerNames.join());
                            }else {
                                Display.show("Message: " + ludogame.message);
                            }
                        }
                    },
			        error: function(){
			            Display.show("Failed to join game!!!");
			        },
                });
            });

         $("#createBtn").parent().click(() => {
            let playerName: string = $("#playerName").val().trim().toUpperCase();
            if (playerName.length === 0) {
                playerName = "DEFAULT";
            }

            switch (newCreatedPlayers.playerMode) {
                case PlayerMode.AiTwoPlayer: {
                    let regularPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red, ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    let aiPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow, ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer);
                    break;
                }
                case PlayerMode.AiFourPlayer: {
                    let regularPlayer: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer);
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    let aiPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    break;
                }
                case PlayerMode.RegularTwoPlayer: {
                    let regularPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red, ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    let regularPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow, ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    break;
                }
                case PlayerMode.RegularFourPlayer: {
                    let regularPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer1);
                    let regularPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Blue], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer2);
                    let regularPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer3);
                    let regularPlayer4: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Green], false);
                    newCreatedPlayers.newPlayers.push(regularPlayer4);
                    break;
                }
                case PlayerMode.AiTwoPlayerAiVsAi: {
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red, ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow, ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    break;
                }
                case PlayerMode.AiFourPlayerAiVsAi: {
                    let aiPlayer1: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Red], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer1);
                    let aiPlayer2: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Blue], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer2);
                    let aiPlayer3: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Yellow], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer3);
                    let aiPlayer4: NewPlayers.NewPlayer = new NewPlayers.NewPlayer([ColorType.Green], true);
                    newCreatedPlayers.newPlayers.push(aiPlayer4);
                    break;
                }
            }
            emit.setEmit(true);
            newCreatedPlayers.isCreator = true;
            creator = true;
            newCreatedPlayers.playerName = playerName;
            this.startGame();
         });

         this.checkExistingSession();

    }

    public checkExistingSession(): void {
        $.ajax({
            type: "POST",
			url: "refresh",
			// tslint:disable-next-line:object-literal-sort-keys
			success: (ludogame) => {
                // Expecting callback({ok: ok, // Expecting callback({ok: ok, updatedludogame: updatedludogame, message: message});: updatedludogame, message: message});
			    if (ludogame.ok) {
			        newCreatedPlayers.ludogame = ludogame.updatedludogame;
                    newCreatedPlayers.hasSavedGame = true;
                    emit.setCurrentPlayerId(ludogame.updatedludogame.playerId);
                    this.startGame();
                }else {
                    Display.show(ludogame.message);
                }
            },
			error: function(){
			    Display.show("Session does not exists");
			},
        });
    }

    public startGame() {
        if (newCreatedPlayers.ludogame) {
            // log.debug("-+++- Ludo game" + JSON.stringify(newCreatedPlayers.ludogame));
        }
        this.game.state.start("Game", true, false, newCreatedPlayers, signal);
    }

}
