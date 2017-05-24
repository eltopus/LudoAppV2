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
        this.startGame();
    }

    public startGame() {
        this.game.state.start("GameSetup", true, false);
    }

}
