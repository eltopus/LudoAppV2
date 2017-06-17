import * as socketIO from "socket.io";
import * as checksum from "checksum";
import {LudoGame} from "./source/game/LudoGame";
import {LudoPlayer} from "./source/game/LudoPlayer";
import {Dictionary} from "typescript-collections";
import {EmitPiece} from "./source/emit/EmitPiece";
import {EmitDie} from "./source/emit/EmitDie";
import {Move} from "./source/rules/Move";
import {LudoCache} from "./LudoCache";
import {States} from "./source/enums/States";

let cache = LudoCache.getInstance();
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
        socket.on("getCheckSum", this.getCheckSum);
        socket.on("disconnect", this.disconnectionHandler);
        socket.on("updateGame", this.updateGame);
        socket.on("saveGame", this.saveGame);
        socket.on("restartGame", this.restartGame);
    }


    public getExistingGame(req: any, callback: any): void {
        let ludogame = cache.getValue(req.body.gameId);
        let ok = false;
        // callback({ludogame: ludogame, foundGame: foundGame, availablePlayerNames: availablePlayerNames});
        this.assignPlayer(ludogame, req, (updatedludogame: any) => {
            if (updatedludogame.foundGame === true && updatedludogame.admin === false) {
                ok = true;
            }
            // tslint:disable-next-line:max-line-length
            callback({ok: ok, updatedludogame: updatedludogame.ludogame, message: updatedludogame.message, availablePlayerNames: updatedludogame.availablePlayerNames, admin: updatedludogame.admin});
        });
    }

    public getRefreshGame(req: any, callback: any): void {
        let ludogame = cache.getValue(req.session.gameId);
        let ok = false;
        let message = "";
        this.assignRefreshPlayer(ludogame, req, (updatedludogame: LudoGame) => {
            if (updatedludogame) {
                ok = true;
            }else {
                message = `Error! ${req.session.gameId} cannot be found!`;
            }
            callback({ok: ok, updatedludogame: updatedludogame, message: message});
        });
    }

    private assignRefreshPlayer(ludogame: LudoGame, req: any, callback: any): void {
        if (ludogame === null || typeof ludogame === "undefined" || req.session.playerName === "ADMIN") {
            if (ludogame && req.session.playerName === "ADMIN") {
                ludogame.playerId = "SOMETHING COMPLETELY RANDOM";
            }
        }else {
            ludogame.playerId = req.session.playerId;
             for (let availPlayer of ludogame.ludoPlayers){
                    if (availPlayer.playerId === req.session.playerId) {
                        availPlayer.isEmpty = false;
                        break;
                    }
                }
        }
        callback(ludogame);
    }

    private assignPlayer(ludogame: LudoGame, req: any, callback: any): void {
        let foundGame = false;
        let admin = false;
        let availablePlayerNames: string[] = [];
        let message = `Cannot join ${req.body.gameId} because it is CANNOT be found!`;
        if (ludogame === null || typeof ludogame === "undefined" || req.body.playerName === "ADMIN") {
            if (ludogame && req.body.playerName === "ADMIN") {
                foundGame = true;
                admin = true;
                ludogame.playerId = "SOMETHING COMPLETELY RANDOM";
                req.session.playerName = req.body.playerName;
                req.session.gameId = ludogame.gameId;
                req.session.playerId = ludogame.playerId;
                message = `You are joining ${req.body.gameId} as a view only player`;
                console.log("Admin is joining the game.....");
            }
        }else {
            let playerName = req.body.playerName;
            if (ludogame.inProgress === true) {
                for (let availPlayer of ludogame.ludoPlayers){
                    if (availPlayer.isEmpty === true) {
                        if (playerName === availPlayer.playerName) {
                            ludogame.playerId = availPlayer.playerId;
                            availPlayer.isEmpty = false;
                            req.session.playerName = playerName;
                            req.session.gameId = ludogame.gameId;
                            req.session.playerId = availPlayer.playerId;
                            foundGame = true;
                            break;
                        }
                        availablePlayerNames.push(availPlayer.playerName);
                    }
                }
                if (availablePlayerNames.length === 0) {
                    message = `Cannot join ${req.body.gameId} because it is full`;
                }

             }else {
                for (let availPlayer of ludogame.ludoPlayers){
                    if (availPlayer.isEmpty) {
                        availPlayer.playerName = playerName;
                        ludogame.playerId = availPlayer.playerId;
                        ludogame.availableColors = this.getAvailableColors(availPlayer.colors, ludogame);
                        availPlayer.isEmpty = false;
                        req.session.playerName = playerName;
                        req.session.gameId = ludogame.gameId;
                        req.session.playerId = availPlayer.playerId;
                        foundGame = true;
                        break;
                    }
                }
            }
        }
        callback({ludogame: ludogame, foundGame: foundGame, availablePlayerNames: availablePlayerNames, message: message, admin: admin});
    }

    private disconnectionHandler(): void {
        let sock: any = this;
        let ludogame = cache.getValue(sock.gameId);
        if (ludogame && sock.playerName !== "ADMIN") {
            for (let disconnectedPlayer of ludogame.ludoPlayers){
                if (disconnectedPlayer.playerId === sock.playerId) {
                    disconnectedPlayer.isEmpty = true;
                    io.in(sock.gameId).emit("disconnectedPlayerId", sock.playerId);
                    sock.leave(sock.gameId);
                    break;
                }
            }
        }else if (ludogame && sock.playerName === "ADMIN") {
            sock.leave(sock.gameId);
        }
        console.log("Playername: " + sock.playerName + " has diconnected");
    }

    private getAvailableColors(chosenColors: string[], ludogame: LudoGame): string[] {
        let availableColors: string[] = [];
        for (let y = 0; y <  ludogame.availableColors.length; ++y) {
            if (!this.containsColor(chosenColors, ludogame.availableColors[y])) {
                availableColors.push(ludogame.availableColors[y]);
            }
        }
        return availableColors;
    }

    private containsColor(colors: string[], color: string): boolean {
        let contains = false;
        for (let c of colors){
            if (c === color) {
                contains = true;
            }
        }
        return contains;
    }

    private createGame(ludogame: LudoGame, callback: any) {
        let sock: any = this;
        sock.handshake.session.gameId = ludogame.gameId;
        sock.handshake.session.playerId = ludogame.ludoPlayers[0].playerId;
        sock.handshake.session.playerName = ludogame.ludoPlayers[0].playerName;
        sock.playerName = ludogame.ludoPlayers[0].playerName;
        sock.gameId = ludogame.gameId;
        sock.playerId = ludogame.ludoPlayers[0].playerId;
        sock.handshake.session.save();
        let colors = ludogame.availableColors;
        let sessionId = sock.handshake.session.id;
        let message = `${ludogame.gameId} was successfuly created with sessionId ${sessionId} and available colors are ${colors}`;
        ludogame.ludoPlayers[0].isEmpty = false;
        cache.setValue(ludogame.gameId, ludogame);
        sock.join(ludogame.gameId);
        callback({ok: true, message: message, emit: true});
    }

    private joinExistingGame(callback: any): void {
        let sock: any = this;
        console.log("GameId: " + sock.handshake.session.gameId + " PlayerId: " + sock.handshake.session.playerId + " playerName: " + sock.handshake.session.playerName);
        let ludogame = cache.getValue(sock.handshake.session.gameId);
        let message = "";
        let ok = false;
        let sessionId = sock.handshake.session.id;
        if (ludogame) {
            sock.gameId = sock.handshake.session.gameId;
            sock.playerName = sock.handshake.session.playerName;
            sock.playerId = sock.handshake.session.playerId;
            ok = true;
            message = `${ludogame.gameId} was successfuly joined....`;
            sock.join(sock.handshake.session.gameId);
            if (sock.handshake.session.playerName !== "ADMIN") {
                if (ludogame.inProgress === false) {
                    let playerMode = 0;
                    for (let ludoplayer of ludogame.ludoPlayers) {
                        if (ludoplayer.isEmpty === true) {
                            ++playerMode;
                        }
                    }
                    if (playerMode === 0) {
                        ludogame.inProgress = true;
                        console.log("Ludo game is in progress.... Setting value to true " + ludogame.inProgress);
                    }

                    console.log("In progress  " + ludogame.inProgress + " ori " + ludogame.originalLudoGame + " mode " + playerMode);
                }
                sock.to(sock.handshake.session.gameId).emit("updateJoinedPlayer", ludogame, sock.handshake.session.playerName);
            }
        }else {
            message = sock.handshake.session.gameId + " does not exist!!!.";
        }
        callback({ok: ok, message: message, emit: false, currrentPlayerId: ludogame.currrentPlayerId});

    }

    private connected(): void {
        console.log("New socket connecting "  + " was found " + socket.id);
    }

    private rollDice(die: EmitDie): void {
        let sock: any = this;
        // console.log("Broadcating roll dice" + sock.id);
        // console.log("----------------------------------------------------------------------------------");
        let ludogame = cache.getValue(die.gameId);
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
        sock.broadcast.to(die.gameId).emit("emitRollDice", die);
    }

    private consumeDie(die: EmitDie): void {
        let ludogame = cache.getValue(die.gameId);
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
        let sock: any  = this;
        let ludogame = cache.getValue(emitPiece.gameId);
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
        sock.volatile.to(emitPiece.gameId).emit("emitSelectActivePiece", emitPiece);
    }

    private setBackToHome(emitPiece: EmitPiece): void {
        let ludogame = cache.getValue(emitPiece.gameId);
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

    private setStateChange(emitPiece: EmitPiece): void {
        let ludogame = cache.getValue(emitPiece.gameId);
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
        let sock: any = this;
        sock.broadcast.to(movement.gameId).emit("emitPieceMovement", movement);
    }

    private aiPieceMovement(movement: Move): void {
        let sock: any = this;
        sock.broadcast.to(movement.gameId).emit("emitAIPieceMovement", movement);
    }

    private selectActiveDie(emitDie: EmitDie): void {
        let sock: any = this;
        let ludogame = cache.getValue(emitDie.gameId);
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
            sock.volatile.to(emitDie.gameId).emit("emitSelectActiveDie", emitDie);
        }
    }

    private unselectActiveDie(emitDie: EmitDie): void {
        let sock: any = this;
        let ludogame = cache.getValue(emitDie.gameId);
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
            sock.volatile.to(emitDie.gameId).emit("emitUnselectActiveDie", emitDie);
        }
    }

    private changePlayer(gameId: string, nextPlayerId: string, callback: any): void {
        let sock: any = this;
        let currentPlayerId = sock.handshake.session.playerId;
        let ludogame: LudoGame = cache.getValue(gameId);
        let indexTotal = 0;
        if (ludogame) {
            if (currentPlayerId === ludogame.ludoPlayers[0].playerId && nextPlayerId !== ludogame.ludoPlayers[0].playerId) {
                let player = ludogame.ludoPlayers.shift();
                ludogame.ludoPlayers.push(player);
                ludogame.ludoDice.dieOne.isConsumed = true;
                ludogame.ludoDice.dieTwo.isConsumed = true;
                ludogame.currrentPlayerId = nextPlayerId;
                // console.log("Current Player ID: " + ludogame.currrentPlayerId);
            }else {
                // console.log("I am not the current player: " + currentPlayerId + " " + ludogame.currrentPlayerId);
            }

            for (let player of ludogame.ludoPlayers) {
                for (let piece of player.pieces){
                    if (piece.state === States.Active || piece.state === States.AtHome || piece.state === States.onWayOut) {
                        indexTotal += piece.index;
                    }
                }
            }
        }
        callback(nextPlayerId, indexTotal);
    }

    private getCheckSum(gameId: string, callback: any): void {
        let check_sum = "";
        let ludogame = cache.getValue(gameId);
        if (ludogame) {
            for (let player of ludogame.ludoPlayers){
                check_sum = check_sum + "#" + (checksum(JSON.stringify(player.pieces)));
            }
        }
        callback(check_sum);
    }

    private updateGame(gameId: string, callback: any): void {
        let ludogame = cache.getValue(gameId);
        callback(ludogame);
    }

    private getNumberOfPlayersIn(gameId: string, playerMode: number): number {
        let ludogame = io.nsps["/"].adapter.rooms[gameId].sockets;
        return Object.keys(ludogame).length;
    }

    private saveGame(ludogame: LudoGame, callback: any): void {
        if (ludogame) {
            cache.setValue(ludogame.gameId, ludogame);
        }
        callback(true);
    }

    private restartGame(callback: any): void {
         let sock: any = this;
         let ludogame = cache.getValue(sock.gameId);
         if (ludogame) {
            ludogame.ludoPlayers.sort((a: LudoPlayer, b: LudoPlayer) => {
                if (a.sequenceNumber < b.sequenceNumber) {
                    return -1;
                }
                if (a.sequenceNumber > b.sequenceNumber) {
                    return 1;
                }
                return 0;
            });

            for (let player of ludogame.ludoPlayers) {
                player.previousDoubleSix = false;
                player.currentSelectedPiece = null;
                for (let piece of player.pieces) {
                    piece.currentPosition = piece.homePosition;
                    piece.index = -1;
                    piece.state = States.AtHome;
                    piece.collidingPiece = null;
                }
            }
            ludogame.ludoDice.dieOne.extFrame = 3;
            ludogame.ludoDice.dieOne.dieValue = 0;
            ludogame.ludoDice.dieOne.isSelected = false;
            ludogame.ludoDice.dieTwo.extFrame = 3;
            ludogame.ludoDice.dieTwo.dieValue = 0;
            ludogame.ludoDice.dieTwo.isSelected = false;
        }
        sock.broadcast.to(sock.gameId).emit("restartGame", ludogame);
        callback(ludogame);
    }

}
