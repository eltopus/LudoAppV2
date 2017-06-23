import {LudoGame} from "../game/Ludogame";
import {EmitDie} from "../emit/EmitDie";
import {factory} from "../logging/ConfigLog4j";
import {EmitPiece} from "../emit/EmitPiece";
import { Emit } from "../emit/Emit";
import * as NodeCache from "node-cache";

let cache = new NodeCache({stdTTL: 36000, checkperiod: 39000, useClones: false});
const log = factory.getLogger("model.LocalGame");
const ttlExtension = 10;
let savedgameId = "";
let emit = Emit.getInstance();
cache.on( "del", function( gameId: any, ludogame: LudoGame ){
    log.debug(`key ${gameId} has been deleted at ${new Date().toLocaleTimeString()}`);
    if (ludogame) {
        saveToLocalStorage(gameId, ludogame);
    }else {
        log.debug("Cannot save Ludo game....");
    }
});

let saveToLocalStorage = function(gameId: any, ludogame: LudoGame ): void {
        if (ludogame) {
            log.debug(`key ${gameId} has been deleted at ${new Date().toLocaleTimeString()}`);
            localStorage.setItem("gameId", JSON.stringify(ludogame));
        }else {
            log.debug("Cannot save Ludo game....");
        }
    };

$(window).on("beforeunload", function() {
    if (emit.isSinglePlayer()) {
        let ludogame = cache.get(savedgameId);
        if (ludogame) {
            // log.debug(`key ${savedgameId} has been deleted at ${new Date().toLocaleTimeString()}`);
            localStorage.setItem("gameId", JSON.stringify(ludogame));
        }
    }
});

export class LocalGame {
    private static localGameInstance: LocalGame = new LocalGame();
    private signal: Phaser.Signal;

    public static getInstance(): LocalGame {
        return LocalGame.localGameInstance;
    }

    constructor() {
        if (LocalGame.localGameInstance) {
            throw new Error("Error: Instantiation failed: Use LocalGame.getInstance() instead of new.");
        }
        LocalGame.localGameInstance = this;
    }

    public saveLudoGame(gameId: string): void {
        let ludogame = cache.get(gameId);
        if (ludogame) {
            log.debug(`key ${gameId} has been deleted at ${new Date().toLocaleTimeString()}`);
            localStorage.setItem("gameId", JSON.stringify(ludogame));
        }else {
            log.debug("Cannot save Ludo game...." + ludogame);
        }
    }


    public setLudoGame(ludogame: LudoGame): void {
         cache.set(ludogame.gameId, ludogame, (err: any, success: any) => {
            if ( !err && success ) {
                log.debug(`Game created and saved in cache successfully is ${success} at ${new Date().toLocaleTimeString()}`);
                log.debug(`key ${ludogame.gameId} was saved to local storage ${new Date().toLocaleTimeString()}`);
                savedgameId = ludogame.gameId;
                localStorage.setItem("gameId", JSON.stringify(ludogame));
            }else {
               log.debug(`Game created saved in cache successfully is ${err}`);
            }
        });
    }

    public rollDice(die: EmitDie): void {
        let ludogame = cache.get(die.gameId);
        cache.ttl( die.gameId, ttlExtension, function( err: any, changed: any ){
            if ( !err ) {
                // console.log( "Roll dice extension" + changed );
            }
        });
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.dieValue);
                ludogame.ludoDice.dieOne = die;
                // log.debug("Dice After " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.dieValue + " con " + ludogame.ludoDice.dieOne.isConsumed);
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.dieValue);
                ludogame.ludoDice.dieTwo = die;
                // log.debug("Dice After " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.dieValue + " con " + ludogame.ludoDice.dieTwo.isConsumed);
            }
            // console.log("----------------------------------------------------------------------------------");
        }
    }

    public consumeDie(die: EmitDie): void {
        let ludogame = cache.get(die.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
                // console.log("Consume Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isConsumed);
                ludogame.ludoDice.dieOne.isConsumed = die.isConsumed;
                // console.log("ConsumeAfter After " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isConsumed);
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
                // console.log("Consume Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isConsumed);
                ludogame.ludoDice.dieTwo.isConsumed = die.isConsumed;
                // console.log("Consume After " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isConsumed);
            }
            // console.log("----------------------------------------------------------------------------------");
        }
    }

    public selectActiveDie(emitDie: EmitDie): void {
        let ludogame = cache.get(emitDie.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
                ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
                // console.log("SelectAfter After " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
                ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
                // console.log("Select After " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
            }
        }
    }

    public unselectActiveDie(emitDie: EmitDie): void {
        let ludogame = cache.get(emitDie.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
                ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
                // console.log("SelectAfter After " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
                ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
                // console.log("Select After " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
            }
        }
    }

    public selectActivePiece(emitPiece: EmitPiece): void {
        let ludogame = cache.get(emitPiece.gameId);
        if (ludogame) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === emitPiece.playerId) {
                    // console.log("Player selectpiece Before " + player.playerId + " value: " + player.currentSelectedPiece);
                    player.currentSelectedPiece = emitPiece.uniqueId;
                    // console.log("Player selectpiece After " + player.playerId + " value: " + player.currentSelectedPiece);
                    break;
                }
            }
        }
    }

    public setStateChange(emitPiece: EmitPiece): void {
        let ludogame = cache.get(emitPiece.gameId);
        if (ludogame) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === emitPiece.playerId) {
                    for (let piece of player.pieces) {
                        if (piece.uniqueId === emitPiece.uniqueId) {
                            // console.log("Piece state change Before " + piece.uniqueId + " value: " + piece.state + " index: " + piece.index);
                            piece.state = emitPiece.state;
                            piece.currentPosition = emitPiece.currentPosition;
                            piece.index = emitPiece.index;
                            // console.log("Piece state change  After " + piece.uniqueId + " value: " + piece.state + " index: " + piece.index);
                            // console.log("---------------------------------------------------------------------------------");
                            // io.in(emitPiece.gameId).emit("emitPieceMovement", emitPiece);
                            break;
                        }
                    }
                }
            }
        }
    }

    public changePlayer(gameId: string, nextPlayerId: string): void {
        let ludogame: LudoGame = cache.get(gameId);
        if (ludogame) {
            let player = ludogame.ludoPlayers.shift();
            ludogame.ludoPlayers.push(player);
            ludogame.ludoDice.dieOne.isConsumed = true;
            ludogame.ludoDice.dieTwo.isConsumed = true;
            ludogame.currrentPlayerId = nextPlayerId;
        }
    }

    public setBackToHome(emitPiece: EmitPiece): void {
        let ludogame = cache.get(emitPiece.gameId);
        if (ludogame) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === emitPiece.playerId) {
                    for (let piece of player.pieces) {
                        if (piece.uniqueId === emitPiece.uniqueId) {
                            // console.log("Piece state Before Peck " + emitPiece.uniqueId + " value: " + emitPiece.state + " index: " + emitPiece.state);
                            piece.state = emitPiece.state;
                            piece.index = emitPiece.index;
                            piece.currentPosition = piece.homePosition;
                            // console.log("Piece state After Peck " + piece.uniqueId + " value: " + piece.state);
                            break;
                        }
                    }
                }
            }
        }
    }

    public writeGameToConsole(gameId: string): void {
        let ludogame = cache.get(gameId);
        if (ludogame) {
            log.debug(JSON.stringify(ludogame, null, "\t"));
        }else {
            log.debug(" Ludo game is " + ludogame);
        }
    }

}
