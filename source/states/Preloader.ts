/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />

export class Preloader extends Phaser.State {

    public preload() {
        this.load.spritesheet("red_piece", "images/red.png", 42, 42, 2);
        this.load.spritesheet("blue_piece", "images/blue.png", 42, 42, 2);
        this.load.spritesheet("green_piece", "images/green.png", 42, 42, 2);
        this.load.spritesheet("yellow_piece", "images/yellow.png", 42, 42, 2);
        this.load.image("play", "images/playbutton.png");
        this.load.image("board", "images/board.jpg");
    }

    public create() {
        this.startGame();
    }

    public startGame() {
        this.game.state.start("Game", true, false);
    }

}