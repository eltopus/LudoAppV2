/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as fs from "fs";
import {PlayerMode} from "../enums/PlayerMode";
import * as NewPlayers from "../entities/NewPlayers";
import {ColorType} from "../enums/ColorType";

export class Preloader extends Phaser.State {

    public preload() {
        this.load.spritesheet("red_piece", "images/red.png", 42, 42, 2);
        this.load.spritesheet("blue_piece", "images/blue.png", 42, 42, 2);
        this.load.spritesheet("green_piece", "images/green.png", 42, 42, 2);
        this.load.spritesheet("yellow_piece", "images/yellow.png", 42, 42, 2);
        this.load.spritesheet("die", "images/dice.png", 64, 64);
        this.load.image("diceBtn", "images/dicebtn.png");
        this.load.image("play", "images/playbutton.png");
        this.load.image("board", "images/board.jpg");
        this.load.image("report", "images/ireport.png");
        this.load.image("updateBtn", "images/update.png");
        this.load.json("ludoGame", "dist/ludoGame.json");
    }

    public create() {
        let newPlayers: NewPlayers.NewPlayer[] = [];
        /*
        let playerOneColors = [ColorType.Red, ColorType.Blue];
        let playerOne: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerOne", playerOneColors, true);
        newPlayers.push(playerOne);
        let playerTwoColors = [ColorType.Yellow, ColorType.Green];
        let playerTwo: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerTwo", playerTwoColors, true);
        newPlayers.push(playerTwo);
        */

        let playerOneColors = [ColorType.Red];
        let playerOne: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerOne", playerOneColors, true);
        newPlayers.push(playerOne);
        let playerTwoColors = [ColorType.Blue];
        let playerTwo: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerTwo", playerTwoColors, true);
        newPlayers.push(playerTwo);
        let playerThreeColors = [ColorType.Yellow];
        let playerThree: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerThree", playerThreeColors, true);
        newPlayers.push(playerThree);
        let playerFourColors = [ColorType.Green];
        let playerFour: NewPlayers.NewPlayer = new NewPlayers.NewPlayer("playerFour", playerFourColors, true);
        newPlayers.push(playerFour);

        let newCreatedPlayers = new NewPlayers.NewPlayers(PlayerMode.AiFourPlayerAiVsAi, newPlayers, true);
        this.startGame(newCreatedPlayers);
    }

    public startGame(newPlayers: NewPlayers.NewPlayers) {
        newPlayers.ludogame = this.game.cache.getJSON("ludoGame");
        this.game.state.start("Game", true, false, newPlayers);
    }

}
