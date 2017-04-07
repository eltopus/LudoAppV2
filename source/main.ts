/// <reference path = "../node_modules/phaser/typescript/phaser.d.ts" />
import {Preloader} from "./states/Preloader";
import {Game} from "./states/Game";

export class LudoGame extends Phaser.Game{
    constructor() {
        super(800, 600, Phaser.AUTO, "gameContainer");
        this.state.add("Preloader", Preloader, false);
        this.state.add("Game", Game, false);
        this.state.start("Preloader"); 
   }
}

window.onload = function() {
    let game = new LudoGame();
}