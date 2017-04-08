/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {PieceInterface} from "../interfaces/PieceInterface";
import {ColorType} from "../enums/ColorType";

export class Piece extends Phaser.Sprite implements PieceInterface{

    public defaultX: number;
    public defaultY: number;
    public group: Phaser.Group;
    public color: ColorType;
    public playerId: string;

    constructor(game: Phaser.Game, x: number, y: number, imageId: string, pieceId: string, color: ColorType, playerId: string){
        super(game, x, y, imageId);
        this.color = color;
        this.defaultX = x;
        this.defaultY = y;
        this.playerId = playerId;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.frame = 0;
        this.group = this.game.add.group();
        this.group.add(this);
    }


}


