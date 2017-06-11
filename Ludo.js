"use strict";
var checksum = require("checksum");
var LudoCache_1 = require("./LudoCache");
var cache = LudoCache_1.LudoCache.getInstance();
var socket;
var io;
var Ludo = (function () {
    function Ludo() {
    }
    //
    Ludo.prototype.initLudo = function (gameio, gamesocket) {
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
    };
    Ludo.prototype.getExistingGame = function (req, callback) {
        var ludogame = cache.getValue(req.body.gameId);
        var ok = false;
        // callback({ludogame: ludogame, foundGame: foundGame, availablePlayerNames: availablePlayerNames});
        this.assignPlayer(ludogame, req, function (updatedludogame) {
            if (updatedludogame.foundGame === true) {
                var playerMode = 0;
                for (var _i = 0, _a = updatedludogame.ludogame.ludoPlayers; _i < _a.length; _i++) {
                    var ludoplayer = _a[_i];
                    if (ludoplayer.isEmpty) {
                        ++playerMode;
                    }
                }
                if (playerMode === 0) {
                    updatedludogame.ludogame.inProgress = true;
                    console.log("Ludo game is in progress....");
                }
                ok = true;
            }
            callback({ ok: ok, updatedludogame: updatedludogame.ludogame, message: updatedludogame.message, availablePlayerNames: updatedludogame.availablePlayerNames });
        });
    };
    Ludo.prototype.getRefreshGame = function (req, callback) {
        var ludogame = cache.getValue(req.session.gameId);
        var ok = false;
        var message = "";
        this.assignRefreshPlayer(ludogame, req, function (updatedludogame) {
            if (updatedludogame) {
                ok = true;
            }
            else {
                message = "Error! " + req.session.gameId + " cannot be found!";
            }
            callback({ ok: ok, updatedludogame: updatedludogame, message: message });
        });
    };
    Ludo.prototype.assignRefreshPlayer = function (ludogame, req, callback) {
        if (ludogame === null || typeof ludogame === "undefined") {
        }
        else {
            ludogame.playerId = req.session.playerId;
        }
        callback(ludogame);
    };
    Ludo.prototype.disconnectionHandler = function () {
        var sock = this;
        var ludogame = cache.getValue(sock.gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var disconnectedPlayer = _a[_i];
                if (disconnectedPlayer.playerId === sock.playerId) {
                    disconnectedPlayer.isEmpty = true;
                    break;
                }
            }
        }
        console.log("Playername: " + sock.playerName + " has diconnected");
        io.in(sock.gameId).emit("disconnectedPlayerId", sock.playerId);
    };
    Ludo.prototype.unassignPlayer = function (ludogame, playerId, callback) {
        if (ludogame === null || typeof ludogame === "undefined") {
        }
        else {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var disconnectedPlayer = _a[_i];
                if (disconnectedPlayer.playerId === playerId) {
                    disconnectedPlayer.isEmpty = true;
                    break;
                }
            }
        }
        callback(playerId);
    };
    Ludo.prototype.assignPlayer = function (ludogame, req, callback) {
        var foundGame = false;
        var availablePlayerNames = [];
        var message = "Cannot join " + req.body.gameId + " because it is CANNOT be found!";
        if (ludogame === null || typeof ludogame === "undefined") {
        }
        else {
            var playerName = req.body.playerName;
            if (ludogame.inProgress) {
                for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                    var availPlayer = _a[_i];
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
                    message = "Cannot join " + req.body.gameId + " because it is full";
                }
            }
            else {
                for (var _b = 0, _c = ludogame.ludoPlayers; _b < _c.length; _b++) {
                    var availPlayer = _c[_b];
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
        callback({ ludogame: ludogame, foundGame: foundGame, availablePlayerNames: availablePlayerNames, message: message });
    };
    Ludo.prototype.getAvailableColors = function (chosenColors, ludogame) {
        var availableColors = [];
        for (var y = 0; y < ludogame.availableColors.length; ++y) {
            if (!this.containsColor(chosenColors, ludogame.availableColors[y])) {
                availableColors.push(ludogame.availableColors[y]);
            }
        }
        return availableColors;
    };
    Ludo.prototype.containsColor = function (colors, color) {
        var contains = false;
        for (var _i = 0, colors_1 = colors; _i < colors_1.length; _i++) {
            var c = colors_1[_i];
            if (c === color) {
                contains = true;
            }
        }
        return contains;
    };
    Ludo.prototype.createGame = function (ludogame, callback) {
        var sock = this;
        sock.handshake.session.gameId = ludogame.gameId;
        sock.handshake.session.playerId = ludogame.ludoPlayers[0].playerId;
        sock.handshake.session.playerName = ludogame.ludoPlayers[0].playerName;
        sock.playerName = ludogame.ludoPlayers[0].playerName;
        sock.gameId = ludogame.gameId;
        sock.playerId = ludogame.ludoPlayers[0].playerId;
        sock.handshake.session.save();
        var colors = ludogame.availableColors;
        var sessionId = sock.handshake.session.id;
        var message = ludogame.gameId + " was successfuly created with sessionId " + sessionId + " and available colors are " + colors;
        ludogame.ludoPlayers[0].isEmpty = false;
        cache.setValue(ludogame.gameId, ludogame);
        sock.join(ludogame.gameId);
        callback({ ok: true, message: message, emit: true });
    };
    Ludo.prototype.joinExistingGame = function (callback) {
        var sock = this;
        console.log("GameId: " + sock.handshake.session.gameId + " PlayerId: " + sock.handshake.session.playerId + " playerName: " + sock.handshake.session.playerName);
        var ludogame = cache.getValue(sock.handshake.session.gameId);
        var message = "";
        var ok = false;
        var sessionId = sock.handshake.session.id;
        if (ludogame) {
            sock.gameId = sock.handshake.session.gameId;
            sock.playerName = sock.handshake.session.playerName;
            sock.playerId = sock.handshake.session.playerId;
            ok = true;
            message = ludogame.gameId + " was successfuly created. currentGameId: " + ludogame.currrentPlayerId;
            sock.join(sock.handshake.session.gameId);
            sock.to(sock.handshake.session.gameId).emit("updateJoinedPlayer", ludogame, sock.handshake.session.playerName);
        }
        else {
            message = sock.handshake.session.gameId + " does not exist!!!.";
        }
        callback({ ok: ok, message: message, emit: false, currrentPlayerId: ludogame.currrentPlayerId });
    };
    Ludo.prototype.connected = function () {
        console.log("New socket connecting " + " was found " + socket.id);
    };
    Ludo.prototype.rollDice = function (die) {
        var sock = this;
        // console.log("Broadcating roll dice" + sock.id);
        // console.log("----------------------------------------------------------------------------------");
        var ludogame = cache.getValue(die.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.dieValue);
                ludogame.ludoDice.dieOne = die;
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
                // console.log("Dice Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.dieValue);
                ludogame.ludoDice.dieTwo = die;
            }
        }
        io.in(die.gameId).emit("emitRollDice", die);
    };
    Ludo.prototype.consumeDie = function (die) {
        var ludogame = cache.getValue(die.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
                // console.log("Consume Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isConsumed);
                ludogame.ludoDice.dieOne.isConsumed = die.isConsumed;
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
                // console.log("Consume Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isConsumed);
                ludogame.ludoDice.dieTwo.isConsumed = die.isConsumed;
            }
        }
    };
    Ludo.prototype.selectActivePiece = function (emitPiece) {
        var sock = this;
        var ludogame = cache.getValue(emitPiece.gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === emitPiece.playerId) {
                    // console.log("Player selectpiece Before " + player.playerId + " value: " + player.currentSelectedPiece);
                    player.currentSelectedPiece = emitPiece.uniqueId;
                    // console.log("Player selectpiece After " + player.playerId + " value: " + player.currentSelectedPiece);
                    break;
                }
            }
        }
        sock.volatile.to(emitPiece.gameId).emit("emitSelectActivePiece", emitPiece);
    };
    Ludo.prototype.setBackToHome = function (emitPiece) {
        var ludogame = cache.getValue(emitPiece.gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === emitPiece.playerId) {
                    for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                        var piece = _c[_b];
                        if (piece.uniqueId === emitPiece.uniqueId) {
                            // console.log("Piece state Before Peck " + piece.uniqueId + " value: " + piece.state);
                            piece.state = emitPiece.state;
                            piece.currentPosition = piece.homePosition;
                            // console.log("Piece state After Peck " + piece.uniqueId + " value: " + piece.state);
                            break;
                        }
                    }
                }
            }
        }
    };
    Ludo.prototype.setStateChange = function (emitPiece) {
        var ludogame = cache.getValue(emitPiece.gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === emitPiece.playerId) {
                    for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                        var piece = _c[_b];
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
    };
    Ludo.prototype.pieceMovement = function (movement) {
        // console.log("Emitting Playing  " + movement.diceId + " on: " + movement.pieceId);
        io.in(movement.gameId).emit("emitPieceMovement", movement);
    };
    Ludo.prototype.aiPieceMovement = function (movement) {
        // console.log("Emitting AI Playing  " + movement.diceId + " on: " + movement.pieceId);
        io.in(movement.gameId).emit("emitAIPieceMovement", movement);
    };
    Ludo.prototype.selectActiveDie = function (emitDie) {
        var sock = this;
        var ludogame = cache.getValue(emitDie.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
                ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
                ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
            }
            // console.log("----------------------------------------------------------------------------------");
            sock.volatile.to(emitDie.gameId).emit("emitSelectActiveDie", emitDie);
        }
    };
    Ludo.prototype.unselectActiveDie = function (emitDie) {
        var sock = this;
        var ludogame = cache.getValue(emitDie.gameId);
        if (ludogame) {
            if (ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
                ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
            }
            if (ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
                ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
            }
            // console.log("----------------------------------------------------------------------------------");
            sock.volatile.to(emitDie.gameId).emit("emitUnselectActiveDie", emitDie);
        }
    };
    Ludo.prototype.changePlayer = function (gameId, nextPlayerId, callback) {
        var sock = this;
        var currentPlayerId = sock.handshake.session.playerId;
        var ludogame = cache.getValue(gameId);
        if (ludogame) {
            if (currentPlayerId === ludogame.ludoPlayers[0].playerId && nextPlayerId !== ludogame.ludoPlayers[0].playerId) {
                var player = ludogame.ludoPlayers.shift();
                ludogame.ludoPlayers.push(player);
                ludogame.ludoDice.dieOne.isConsumed = true;
                ludogame.ludoDice.dieTwo.isConsumed = true;
                ludogame.currrentPlayerId = nextPlayerId;
                console.log("Current Player ID: " + ludogame.currrentPlayerId);
            }
            else {
            }
        }
        callback(nextPlayerId);
    };
    Ludo.prototype.getCheckSum = function (gameId, callback) {
        var check_sum = "";
        var ludogame = cache.getValue(gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                check_sum = check_sum + "#" + (checksum(JSON.stringify(player.pieces)));
            }
        }
        callback(check_sum);
    };
    return Ludo;
}());
exports.Ludo = Ludo;
