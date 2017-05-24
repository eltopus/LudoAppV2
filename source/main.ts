/// <reference path = "../node_modules/phaser/typescript/phaser.d.ts" />
import {Preloader} from "./states/Preloader";
import {GameSetup} from "./states/GameSetup";
import {Game} from "./states/Game";

export class LudoGame extends Phaser.Game {
    constructor() {
        super(900, 720, Phaser.AUTO, "gameContainer");
        this.state.add("Preloader", Preloader, false);
        this.state.add("GameSetup", GameSetup, false);
        this.state.add("Game", Game, false);
        this.state.start("Preloader");
   }
}

window.onload = function() {
    let game = new LudoGame();
};
