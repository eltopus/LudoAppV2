import * as socketIO from "socket.io";
import {LudoGame} from "./source/game/LudoGame";
import {Dictionary} from "typescript-collections";

let games = new Dictionary<String, LudoGame>();
let socket: SocketIO.Socket;
let io: SocketIO.Server;
export class Ludo {
//
    public initLudo(gameio: SocketIO.Server, gamesocket: SocketIO.Socket) {
        io = gameio;
        socket = gamesocket;

        socket.on("saveGameToServer", this.createGame);
        socket.on("rollDice", this.rollDice);
        socket.on("joinExistingGame", this.joinExistingGame);
        socket.on("connected", this.connected);
        socket.on("disconnect", () => {
                console.log("Client disconnected");
        });
    }


    public getExistingGame(gameId: string, callback): void {
        let ludogame = games.getValue(gameId);
        callback(ludogame);
    }

    private createGame(ludogame: LudoGame, callback) {
        games.setValue(ludogame.gameId, ludogame);
        socket.join(ludogame.gameId);
        callback({ok: true, message: ludogame.gameId + " was successfuly created." + socket.id, emit: true});
    }

    private joinExistingGame(gameId: string, callback): void {
        let ludogame = games.getValue(gameId);
        if (ludogame) {
            console.log(ludogame.gameId + " was successfuly joined." + socket.id);
            socket.join(gameId);
            callback({ok: true, message: ludogame.gameId + " was successfuly joined." + socket.id, emit: false});
        }else {
            callback({ok: false, message: gameId + " does not exist!!!.", emit: false});
        }

    }

    private connected(): void {
        console.log("New socket connecting "  + " was found " + socket.id);
    }

    private rollDice(dice: any, callback): void {
        console.log("Broadcating roll dice" + socket.id);
        socket.broadcast.to(dice.gameId).emit("emitRollDice", dice);
        callback(dice);
    }
}
