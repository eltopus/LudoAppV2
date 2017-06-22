"use strict";
var checksum = require("checksum");
// import * as cache from "memory-cache";
var NodeCache = require("node-cache");
var async = require("async");
var LudoPersistence_1 = require("./LudoPersistence");
var States_1 = require("./source/enums/States");
var LudoGameStatus_1 = require("./source/enums/LudoGameStatus");
var cache = new NodeCache({ stdTTL: 3600, checkperiod: 3800, useClones: false });
/*
let redis = new ioredis({
    family: 4,
    host: "192.168.5.129",
    port: 6379,
});

let ping = function(e) {
    let result = redis.ping()
        .then(function(e) {
            console.log(redis);
            console.log("Connected!");
        })
        .catch(function(e) {
            console.log("Error:", e);
        })
        .finally(function() {
            redis.quit();
        });
};
*/
var persistence = LudoPersistence_1.LudoPersistence.getInstance();
var socket;
var io;
var ttlExtension = 1000;
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
        socket.on("updateGame", this.updateGame);
        socket.on("saveGame", this.saveGame);
        socket.on("saveLudoGame", this.saveLudoGame);
        socket.on("restartGame", this.restartGame);
        /*
        cache.on( "expired", ( key: any, value: any ) => {
            console.log(`key ${key} has expired and its about to be deleted at ${new Date().toLocaleTimeString()}`);
        });
        */
        cache.on("del", function (gameId, ludogame) {
            console.log("key " + gameId + " has been deleted at " + new Date().toLocaleTimeString());
            io.to(gameId).emit("message", "Your game session for " + gameId + " has timed out", "TIMEOUT");
            if (ludogame.status === LudoGameStatus_1.LudoGameStatus.INPROGRESS) {
                ludogame.status = LudoGameStatus_1.LudoGameStatus.SUSPENDED;
                persistence.setValue(ludogame);
            }
        });
    };
    Ludo.prototype.getExistingGame = function (req, callback) {
        var _this = this;
        var ok = false;
        this.fetchLudoGame(req.body.gameId, function (ludogame) {
            console.log(" I got result back" + ludogame);
            _this.assignPlayer(ludogame, req, function (updatedludogame) {
                if (updatedludogame.foundGame === true && updatedludogame.admin === false) {
                    ok = true;
                }
                // tslint:disable-next-line:max-line-length
                callback({ ok: ok, updatedludogame: updatedludogame.ludogame, message: updatedludogame.message, availablePlayerNames: updatedludogame.availablePlayerNames, admin: updatedludogame.admin });
            });
        });
    };
    Ludo.prototype.getRefreshGame = function (req, callback) {
        var _this = this;
        var ok = false;
        var message = "";
        this.fetchLudoGame(req.session.gameId, function (ludogame) {
            console.log(" I got result back" + ludogame);
            _this.assignRefreshPlayer(ludogame, req, function (updatedludogame) {
                if (updatedludogame) {
                    ok = true;
                }
                else {
                    message = "Error! " + req.session.gameId + " cannot be found!";
                }
                callback({ ok: ok, updatedludogame: updatedludogame, message: message });
            });
        });
    };
    Ludo.prototype.assignRefreshPlayer = function (ludogame, req, callback) {
        if (ludogame === null || typeof ludogame === "undefined" || req.session.playerName === "ADMIN") {
            if (ludogame && req.session.playerName === "ADMIN") {
                ludogame.playerId = "SOMETHING COMPLETELY RANDOM";
            }
        }
        else {
            ludogame.playerId = req.session.playerId;
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var availPlayer = _a[_i];
                if (availPlayer.playerId === req.session.playerId) {
                    availPlayer.isEmpty = false;
                    break;
                }
            }
        }
        callback(ludogame);
    };
    Ludo.prototype.assignPlayer = function (ludogame, req, callback) {
        var foundGame = false;
        var admin = false;
        var availablePlayerNames = [];
        var message = "Cannot join " + req.body.gameId + " because it is CANNOT be found!";
        if (ludogame === null || typeof ludogame === "undefined" || req.body.playerName === "ADMIN") {
            if (ludogame && req.body.playerName === "ADMIN") {
                foundGame = true;
                admin = true;
                ludogame.playerId = "SOMETHING COMPLETELY RANDOM";
                req.session.playerName = req.body.playerName;
                req.session.gameId = ludogame.gameId;
                req.session.playerId = ludogame.playerId;
                message = "You are joining " + req.body.gameId + " as a view only player";
                console.log("Admin is joining the game.....");
            }
        }
        else {
            var playerName = req.body.playerName;
            if (ludogame.status === LudoGameStatus_1.LudoGameStatus.INPROGRESS) {
                for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                    var availPlayer = _a[_i];
                    if (availPlayer.isEmpty === true) {
                        // console.log("Available name " + availPlayer.playerName);
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
        callback({ ludogame: ludogame, foundGame: foundGame, availablePlayerNames: availablePlayerNames, message: message, admin: admin });
    };
    Ludo.prototype.disconnectionHandler = function () {
        var sock = this;
        var ludogame;
        try {
            ludogame = cache.get(sock.gameId);
        }
        catch (err) {
            console.log("Disconnection error ");
        }
        if (ludogame && sock.playerName !== "ADMIN") {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var disconnectedPlayer = _a[_i];
                if (disconnectedPlayer.playerId === sock.playerId) {
                    disconnectedPlayer.isEmpty = true;
                    io.in(sock.gameId).emit("disconnectedPlayerId", sock.playerId);
                    sock.leave(sock.gameId);
                    break;
                }
            }
            var clients = io.sockets.adapter.rooms[sock.gameId];
            var numClients = (typeof clients !== "undefined") ? Object.keys(clients).length : 0;
            if (numClients === 0 && ludogame.status === LudoGameStatus_1.LudoGameStatus.INPROGRESS) {
                console.log("Room is empty! Saving to database..........." + numClients);
                persistence.setValue(ludogame);
            }
        }
        else if (ludogame && sock.playerName === "ADMIN") {
            sock.leave(sock.gameId);
        }
        console.log("Playername: " + sock.playerName + " has diconnected");
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
        cache.set(ludogame.gameId, ludogame, function (err, success) {
            if (!err && success) {
                console.log("Game created and saved in cache successfully is " + success + " at " + new Date().toLocaleTimeString());
            }
            else {
                console.log("Game created saved in cache successfully is " + err);
            }
        });
        sock.join(ludogame.gameId);
        callback({ ok: true, message: message, emit: true });
    };
    Ludo.prototype.joinExistingGame = function (callback) {
        var sock = this;
        var message = "";
        var ok = false;
        var currentPlayerId;
        if (sock.handshake.session && sock.handshake.session.gameId) {
            //
            console.log("GameId: " + sock.handshake.session.gameId + " PlayerId: " + sock.handshake.session.playerId + " playerName: " + sock.handshake.session.playerName);
            var ludogame_1 = cache.get(sock.handshake.session.gameId);
            var sessionId = sock.handshake.session.id;
            if (ludogame_1) {
                sock.gameId = sock.handshake.session.gameId;
                sock.playerName = sock.handshake.session.playerName;
                sock.playerId = sock.handshake.session.playerId;
                currentPlayerId = ludogame_1.currrentPlayerId;
                ok = true;
                message = ludogame_1.gameId + " was successfuly joined....";
                sock.join(sock.handshake.session.gameId);
                if (sock.handshake.session.playerName !== "ADMIN") {
                    if (ludogame_1.status === LudoGameStatus_1.LudoGameStatus.NEW) {
                        var playerMode = 0;
                        for (var _i = 0, _a = ludogame_1.ludoPlayers; _i < _a.length; _i++) {
                            var ludoplayer = _a[_i];
                            if (ludoplayer.isEmpty === true) {
                                ++playerMode;
                            }
                        }
                        if (playerMode === 0) {
                            ludogame_1.status = LudoGameStatus_1.LudoGameStatus.INPROGRESS;
                            console.log("Ludo game is in progress.... Setting value to true ");
                            cache.set(ludogame_1.gameId, ludogame_1, function (err, success) {
                                if (!err && success) {
                                    console.log("Game " + ludogame_1.gameId + " was successfully jonined at " + new Date().toLocaleTimeString());
                                    persistence.setValue(ludogame_1);
                                }
                                else {
                                    console.log("Game in progress update is saved in cache successfully?  " + err);
                                }
                            });
                        }
                    }
                    sock.to(sock.handshake.session.gameId).emit("updateJoinedPlayer", ludogame_1, sock.handshake.session.playerName);
                }
            }
            else {
                message = sock.handshake.session.gameId + " does not exist!!!.";
            }
        }
        callback({ ok: ok, message: message, emit: false, currrentPlayerId: currentPlayerId });
    };
    Ludo.prototype.connected = function () {
        console.log("New socket connecting " + " was found " + socket.id);
    };
    Ludo.prototype.rollDice = function (die) {
        var sock = this;
        // console.log("Broadcating roll dice" + sock.id);
        // console.log("----------------------------------------------------------------------------------");
        var ludogame = cache.get(die.gameId);
        cache.ttl(die.gameId, ttlExtension, function (err, changed) {
            if (!err) {
            }
        });
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
        sock.broadcast.to(die.gameId).emit("emitRollDice", die);
    };
    Ludo.prototype.consumeDie = function (die) {
        var ludogame = cache.get(die.gameId);
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
        var ludogame = cache.get(emitPiece.gameId);
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
        var ludogame = cache.get(emitPiece.gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player.playerId === emitPiece.playerId) {
                    for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                        var piece = _c[_b];
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
    };
    Ludo.prototype.setStateChange = function (emitPiece) {
        var ludogame = cache.get(emitPiece.gameId);
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
        var sock = this;
        sock.broadcast.to(movement.gameId).emit("emitPieceMovement", movement);
    };
    Ludo.prototype.aiPieceMovement = function (movement) {
        var sock = this;
        sock.broadcast.to(movement.gameId).emit("emitAIPieceMovement", movement);
    };
    Ludo.prototype.selectActiveDie = function (emitDie) {
        var sock = this;
        var ludogame = cache.get(emitDie.gameId);
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
        var ludogame = cache.get(emitDie.gameId);
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
        var ludogame = cache.get(gameId);
        var indexTotal = 0;
        if (ludogame) {
            if (currentPlayerId === ludogame.ludoPlayers[0].playerId && nextPlayerId !== ludogame.ludoPlayers[0].playerId) {
                var player = ludogame.ludoPlayers.shift();
                ludogame.ludoPlayers.push(player);
                ludogame.ludoDice.dieOne.isConsumed = true;
                ludogame.ludoDice.dieTwo.isConsumed = true;
                ludogame.currrentPlayerId = nextPlayerId;
            }
            else {
            }
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                    var piece = _c[_b];
                    if (piece.state === States_1.States.Active || piece.state === States_1.States.AtHome || piece.state === States_1.States.onWayOut) {
                        indexTotal += piece.index;
                    }
                }
            }
        }
        callback(nextPlayerId, indexTotal);
    };
    Ludo.prototype.getCheckSum = function (gameId, callback) {
        var check_sum = "";
        var ludogame = cache.get(gameId);
        if (ludogame) {
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                check_sum = check_sum + "#" + (checksum(JSON.stringify(player.pieces)));
            }
        }
        callback(check_sum);
    };
    Ludo.prototype.updateGame = function (gameId, callback) {
        var ludogame = cache.get(gameId);
        callback(ludogame);
    };
    Ludo.prototype.getNumberOfPlayersIn = function (gameId, callback) {
        var ludogame = io.nsps["/"].adapter.rooms[gameId].sockets;
        callback(Object.keys(ludogame).length);
    };
    Ludo.prototype.saveGame = function (ludogame, callback) {
        if (ludogame) {
            cache.set(ludogame.gameId, ludogame, function (err, success) {
                if (!err && success) {
                    console.log("Game is saved in cache successfully? " + success);
                }
                else {
                    console.log("Game is saved in cache successfully?  " + err);
                }
            });
        }
        callback(true);
    };
    Ludo.prototype.saveLudoGame = function (gameId, callback) {
        cache.get(gameId, function (err, ludogame) {
            if (!err) {
                if (typeof ludogame !== "undefined" && ludogame !== null && ludogame.status === LudoGameStatus_1.LudoGameStatus.INPROGRESS) {
                    persistence.setUpdate(ludogame);
                }
            }
            callback(ludogame);
        });
    };
    Ludo.prototype.restartGame = function (callback) {
        var sock = this;
        var ludogame = cache.get(sock.gameId);
        if (ludogame) {
            ludogame.ludoPlayers.sort(function (a, b) {
                if (a.sequenceNumber < b.sequenceNumber) {
                    return -1;
                }
                if (a.sequenceNumber > b.sequenceNumber) {
                    return 1;
                }
                return 0;
            });
            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                var player = _a[_i];
                player.previousDoubleSix = false;
                player.currentSelectedPiece = null;
                for (var _b = 0, _c = player.pieces; _b < _c.length; _b++) {
                    var piece = _c[_b];
                    piece.currentPosition = piece.homePosition;
                    piece.index = -1;
                    piece.state = States_1.States.AtHome;
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
    };
    Ludo.prototype.getFromCache = function (gameId, callback) {
        var ludogame;
        try {
            ludogame = cache.get(gameId);
        }
        catch (err) {
            console.log("Getting error " + err);
        }
        callback(ludogame);
    };
    Ludo.prototype.fetchLudoGame = function (gameId, cb) {
        var _this = this;
        async.waterfall([
            function (callback) {
                _this.getFromCache(gameId, function (result) {
                    console.log(" I am getting result from cache " + result);
                    callback(null, result);
                });
            },
            function (result, callback) {
                if (result === null || typeof result === "undefined") {
                    // console.log(" Result is null I am getting result from mongo " + gameId);
                    persistence.getValue(gameId, function (resultfromdb) {
                        var ludogame = resultfromdb[0];
                        if (ludogame) {
                            for (var _i = 0, _a = ludogame.ludoPlayers; _i < _a.length; _i++) {
                                var player = _a[_i];
                                player.isEmpty = true;
                            }
                            // console.log(" I resaving in cache " + ludogame);
                            cache.set(ludogame.gameId, ludogame, function (err, success) {
                                if (!err && success) {
                                    console.log("Game from mongo is saved in cache successfully? " + success);
                                }
                                else {
                                    console.log("Game from mongo is saved in cache successfully?  " + err);
                                }
                            });
                        }
                        console.log(" I am returning result from mongo " + ludogame);
                        return callback(ludogame);
                    });
                }
                else {
                    // console.log(" I am returning result from cache " + result + " req" + gameId);
                    callback(result);
                }
            },
        ], function (result) {
            // console.log(" I am returning frinal result " + result);
            cb(result);
        });
    };
    return Ludo;
}());
exports.Ludo = Ludo;
