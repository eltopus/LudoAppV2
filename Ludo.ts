import * as socketIO from "socket.io";
import {LudoGame} from "./source/game/LudoGame";
import {Dictionary} from "typescript-collections";

let games = new Dictionary<String, LudoGame>();
let socket: any;
let io: any;
export class Ludo {
    private socket: any;
    private io: SocketIO.Server;
//
    public initLudo(gameio: SocketIO.Server, gamesocket: SocketIO.Socket) {
        io = gameio;
        socket = gamesocket;

        socket.on("saveGameToServer", this.saveGameToServer);
        socket.on("rollDice", this.rollDice);
    }

    private saveGameToServer(ludogame: LudoGame, callback) {
        games.setValue(ludogame.gameId, ludogame);
        callback(JSON.stringify(ludogame));
    }

    private rollDice(dice: any, callback): void {
        callback(JSON.stringify(dice));
    }
}
