import * as socketIO from "socket.io";
import {LudoGame} from "./source/game/LudoGame";
import {Dictionary} from "typescript-collections";
import {EmitPiece} from "./source/emit/EmitPiece";
import {EmitDie} from "./source/emit/EmitDie";
import {Move} from "./source/rules/Move";

let games = new Dictionary<String, LudoGame>();
let socket: SocketIO.Socket;
let io: SocketIO.Server;
export class Ludo {
//
    public initLudo(gameio: SocketIO.Server, gamesocket: SocketIO.Socket) {
        io = gameio;
        socket = gamesocket;

        socket.on("createGame", this.createGame);
        socket.on("rollDice", this.rollDice);
        socket.on("joinExistingGame", this.joinExistingGame);
        socket.on("connected", this.connected);
        socket.on("selectActivePiece", this.selectActivePiece);
        socket.on("pieceMovement", this.pieceMovement);
        socket.on("aiPieceMovement", this.aiPieceMovement);
        socket.on("selectActiveDie", this.selectActiveDie);
        socket.on("unselectActiveDie", this.unselectActiveDie);
        socket.on("consumeDie", this.consumeDie);
        socket.on("setBackToHome", this.setBackToHome);
        socket.on("setStateChange", this.setStateChange);
        socket.on("changePlayer", this.changePlayer);
        socket.on("disconnect", () => {
                console.log("Client disconnected");
        });
    }


    public getExistingGame(gameId: string, callback: any): void {
        let ludogame = games.getValue(gameId);
        callback(ludogame);
    }

    private createGame(ludogame: LudoGame, callback: any) {
        games.setValue(ludogame.gameId, ludogame);
        socket.join(ludogame.gameId);
        callback({ok: true, message: ludogame.gameId + " was successfuly created." + socket.id, emit: true});
    }

    private joinExistingGame(gameId: string, callback: any): void {
        let ludogame = games.getValue(gameId);
        let message = "";
        if (ludogame) {
            message = ludogame.gameId + " was successfuly joined.";
            socket.join(gameId);
            console.log(message + " " + socket.id);
        }else {
            message = gameId + " does not exist!!!.";
            console.log(message + " " + socket.id);
        }
        callback({ok: true, message: message + socket.id, emit: false});

    }

    private connected(): void {
        console.log("New socket connecting "  + " was found " + socket.id);
    }

    private rollDice(die: EmitDie): void {
        // console.log("Broadcating roll dice" + socket.id);
        // console.log("----------------------------------------------------------------------------------");
        let ludogame = games.getValue(die.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.dieValue);
                ludogame.ludoDice.dieOne = die;
                // console.log("Dice After " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.dieValue);
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.dieValue);
                ludogame.ludoDice.dieTwo = die;
                // console.log("Dice After " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.dieValue);
            }
            // console.log("----------------------------------------------------------------------------------");
        }
        io.in(die.gameId).emit("emitRollDice", die);
    }

    private consumeDie(die: EmitDie): void {
        let ludogame = games.getValue(die.gameId);
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



    private selectActivePiece(emitPiece: EmitPiece): void {
        let ludogame = games.getValue(emitPiece.gameId);
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
        io.in(emitPiece.gameId).emit("emitSelectActivePiece", emitPiece);
    }

    private setBackToHome(emitPiece: EmitPiece): void {
        let ludogame = games.getValue(emitPiece.gameId);
        if (ludogame) {
            for (let player of ludogame.ludoPlayers){
                if (player.playerId === emitPiece.playerId) {
                    for (let piece of player.pieces) {
                        if (piece.uniqueId === emitPiece.uniqueId) {
                            console.log("Piece state Before Peck " + piece.uniqueId + " value: " + piece.state);
                            piece.state = emitPiece.state;
                            piece.currentPosition = piece.homePosition;
                            console.log("Piece state After Peck " + piece.uniqueId + " value: " + piece.state);
                            break;
                        }
                    }
                }
            }
        }
    }

    private setStateChange(emitPiece: EmitPiece): void {
        let ludogame = games.getValue(emitPiece.gameId);
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

    private pieceMovement(movement: Move): void {
        // console.log("Emitting Playing  " + movement.diceId + " on: " + movement.pieceId);
        io.in(movement.gameId).emit("emitPieceMovement", movement);
    }

    private aiPieceMovement(movement: Move): void {
        // console.log("Emitting AI Playing  " + movement.diceId + " on: " + movement.pieceId);
        io.in(movement.gameId).emit("emitAIPieceMovement", movement);
    }

    private selectActiveDie(emitDie: EmitDie): void {
        let ludogame = games.getValue(emitDie.gameId);
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
            // console.log("----------------------------------------------------------------------------------");
        }
        io.in(emitDie.gameId).emit("emitSelectActiveDie", emitDie);
    }

    private unselectActiveDie(emitDie: EmitDie): void {
        let ludogame = games.getValue(emitDie.gameId);
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
            // console.log("----------------------------------------------------------------------------------");
        }
        io.in(emitDie.gameId).emit("emitUnselectActiveDie", emitDie);
    }

    private changePlayer(gameId: string): void {
        let ludogame = games.getValue(gameId);
        if (ludogame) {
            // console.log("");
            for (let players of ludogame.ludoPlayers){
                // console.log("Change Before " + players.colors.join());
            }
            let player = ludogame.ludoPlayers.shift();
            ludogame.ludoPlayers.push(player);
            ludogame.ludoDice.dieOne.isConsumed = true;
            ludogame.ludoDice.dieTwo.isConsumed = true;
            // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ " + player.colors.join());
            io.in(gameId).emit("emitChangePlayer", player.playerId);
        }
    }

}
