import {ColorType} from "../enums/ColorType";
import {PlayerMode} from "../enums/PlayerMode";

export class NewPlayer {
    public color: ColorType[];
    public playerName: string;
    public isAI: boolean;
    public isCreator = false;
    constructor(playerName: string, color: ColorType[], isAI: boolean) {
        this.color = color;
        this.playerName = playerName;
        this.isAI = isAI;
    }
}

export class NewPlayers {
    public playerMode: PlayerMode = null;
    public newPlayers: NewPlayer[] = [];
    public hasSavedGame = false;
    public ludogame: any = null;
    public isCreator = false;

    /*
    constructor(playerMode: PlayerMode, newPlayers: NewPlayer[], hasSavedGame: boolean, ludogame?: any) {
        this.playerMode = playerMode;
        this.newPlayers = newPlayers;
        this.hasSavedGame = hasSavedGame;
        this.ludogame = ludogame;
    }
    */
}
