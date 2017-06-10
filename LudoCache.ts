
import * as checksum from "checksum";
import {LudoGame} from "./source/game/LudoGame";
import {Dictionary} from "typescript-collections";

export class LudoCache {
    private static cacheInstance: LudoCache = new LudoCache();
    private games = new Dictionary<String, LudoGame>();

    public static getInstance(): LudoCache {
        return LudoCache.cacheInstance;
    }

    constructor() {
        if (LudoCache.cacheInstance) {
            throw new Error("Error: Instantiation failed: Use LudoCacheInstance.getInstance() instead of new.");
        }
        LudoCache.cacheInstance = this;
    }

    public setValue(key: string, ludogame: LudoGame): void {
        this.games.setValue(key, ludogame);
    }

    public getValue(key: string): LudoGame {
         return (this.games.getValue(key));
    }

    public addPlayerName(playerName: string, playerId: string, gameId: string, callback: any): void {
        let ludogame = this.games.getValue(gameId);
        let message = `${playerName} cannot be added due to errors ecountered`;
        let ok = false;
        if (ludogame.gameId) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === playerId) {
                    player.playerName = playerName;
                    message = `Player name ${player.playerName} was sucessfully added with colors ${player.colors}`;
                    player.isEmpty = false;
                    ok = true;
                    break;
                }
            }
        }
        callback({ok: ok, message: message, playerName: playerName});
    }

    public removePlayerName(playerId: string, gameId: string, callback: any): void {
        let ludogame = this.games.getValue(gameId);
        let message = "Player Name  cannot be found";
        let playerName = "";
        let ok = false;
        if (ludogame.gameId) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === playerId) {
                    player.isEmpty = true;
                    message = "Player Name" + player.playerName + " was successufly removed";
                    ok = true;
                    break;
                }
            }
        }
        callback({ok: ok, message: message, playerName: playerName});
    }

    public gameIsFull(gameId: string): boolean {
        let occupiedPlayerCounts = 0;
        let isFull = false;
        let ludogame = this.games.getValue(gameId);
        if (ludogame.gameId) {
            for (let player of ludogame.ludoPlayers){
                if (!player.isEmpty) {
                    ++occupiedPlayerCounts;
                }
            }
            isFull = (occupiedPlayerCounts === ludogame.ludoPlayers.length);
        }
        return isFull;
    }

    public deleteGame(gameId: string, callback: any): void {
        let message = "";
        if (this.games.containsKey(gameId)) {
            this.games.remove(gameId);
            message = "GameID " + gameId + " sucessfully deleted";
        }else {
           message = "GameID " + gameId + " cannot be delected ";
        }
        callback(message);
    }

    public getCacheLength(): number {
        return this.games.size();
    }

}
