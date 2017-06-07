"use strict";
var Rules_1 = require("../rules/Rules");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var EmitDie_1 = require("../emit/EmitDie");
var EmitPiece_1 = require("../emit/EmitPiece");
var Emit_1 = require("../emit/Emit");
var Paths = require("../entities/Paths");
var emit = Emit_1.Emit.getInstance();
var log = ConfigLog4j_1.factory.getLogger("model.RuleEnforcer");
var RuleEnforcer = (function () {
    function RuleEnforcer(signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard, gameId, socket, currentPossibleMovements) {
        this.rollCounter = 0;
        this.emitRollCounter = 0;
        this.emitDie = new EmitDie_1.EmitDie();
        this.emitDice = [];
        this.emitPiece = new EmitPiece_1.EmitPiece();
        this.activepath = new Paths.ActivePath();
        this.onwayoutpath = new Paths.OnWayOutPaths();
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.gameId = gameId;
        this.socket = socket;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules_1.Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
        this.signal.add(this.onCompletePieceMovement, this, 0, "completeMovement");
        this.signal.add(this.setStateChange, this, 0, "setStateChange");
        this.emitDie.gameId = gameId;
        if (emit.getEnableSocket()) {
            this.setSocketHandlers();
        }
    }
    RuleEnforcer.prototype.setRollCounter = function (rollCounter) {
        this.rollCounter = rollCounter;
    };
    RuleEnforcer.prototype.endOfDiceRoll = function (listener) {
        var _this = this;
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.generateAllPossibleMoves(function (moveIsEmpty) {
                    if (moveIsEmpty) {
                        setTimeout(function () { return _this.handleEmptyPossibleMovements(); }, 1000);
                    }
                    else {
                        var currentPlayer = _this.scheduler.getCurrentPlayer();
                        if (_this.dice.rolledDoubleSix()) {
                            currentPlayer.previousDoubleSix = true;
                        }
                        if (currentPlayer.isAI) {
                            if (emit.getEmit()) {
                                _this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, _this.currentPossibleMovements);
                            }
                        }
                    }
                });
            }
        }
    };
    /**
     * Generates move object using selected piece and selected die or dice
     * @param dieIds
     * @param piece
     */
    RuleEnforcer.prototype.generatePieceMovement = function (dieIds, piece) {
        var _this = this;
        var pieceMovement = this.rule.generatePieceMovement(dieIds, piece);
        if (emit.getEmit() && emit.getEnableSocket()) {
            this.emitAIPieceMovement(pieceMovement);
        }
        var canPlay = false;
        var possibleMovements = this.currentPossibleMovements.getPieceMoves(piece.state);
        var currentPlayer = this.scheduler.getCurrentPlayer();
        for (var _i = 0, possibleMovements_1 = possibleMovements; _i < possibleMovements_1.length; _i++) {
            var movement = possibleMovements_1[_i];
            if (movement.compare(pieceMovement)) {
                canPlay = true;
                movement = this.filterConsumeDieValueSixMovement(movement, piece);
                var diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(movement.diceId));
                this.dice.consumeDieValueById(movement.diceId);
                var path = piece.constructPath(diceValue);
                if (!path.isEmpty()) {
                    piece.index = path.newIndex;
                    // Condition for collision or peck
                    if (piece.isActive()) {
                        var id = this.checkCollision(piece.uniqueId, piece.index);
                        if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                            var backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                            if (backToHomePiece !== null) {
                                backToHomePiece.setAtHome();
                                if (emit.getEmit() === true && emit.getEnableSocket()) {
                                    this.emitPiece.setParameters(backToHomePiece);
                                    this.signal.dispatch("setBackToHomeLocal", this.emitPiece);
                                    this.socket.emit("setBackToHome", this.emitPiece);
                                }
                                piece.collidingPiece = backToHomePiece.uniqueId;
                            }
                        }
                    }
                    piece.movePiece(path);
                    break;
                }
                else {
                    log.debug("I don't know what to do...............");
                    break;
                }
            }
        }
        if (canPlay) {
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
            this.generateAllPossibleMoves(function (moveIsEmpty) {
                if (moveIsEmpty) {
                    setTimeout(function () { return _this.handleEmptyPossibleMovements(); }, 1000);
                }
            });
        }
        else {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
        }
        return pieceMovement;
    };
    RuleEnforcer.prototype.getPieceByUniqueId = function (uniqueId) {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    };
    RuleEnforcer.prototype.generateAIPieceMovement = function (piece, aiPieceMovement) {
        var _this = this;
        if (emit.getEmit() && emit.getEnableSocket()) {
            this.emitAIPieceMovement(aiPieceMovement);
        }
        aiPieceMovement = this.filterConsumeDieValueSixMovement(aiPieceMovement, piece);
        var currentPlayer = this.scheduler.getCurrentPlayer();
        var diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(aiPieceMovement.diceId));
        this.dice.consumeDieValueById(aiPieceMovement.diceId);
        var path = piece.constructPath(diceValue);
        if (!path.isEmpty()) {
            piece.index = path.newIndex;
            // Condition for collision or peck
            if (piece.isActive()) {
                var id = this.checkCollision(piece.uniqueId, piece.index);
                if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                    var backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                    if (backToHomePiece !== null) {
                        backToHomePiece.setAtHome();
                        if (emit.getEmit() === true && emit.getEnableSocket()) {
                            this.emitPiece.setParameters(backToHomePiece);
                            this.signal.dispatch("setBackToHomeLocal", this.emitPiece);
                            this.socket.emit("setBackToHome", this.emitPiece);
                        }
                        piece.collidingPiece = backToHomePiece.uniqueId;
                    }
                }
            }
            piece.movePiece(path);
        }
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
        this.generateAllPossibleMoves(function (moveIsEmpty) {
            if (moveIsEmpty) {
                setTimeout(function () { return _this.handleEmptyPossibleMovements(); }, 1000);
            }
        });
        return aiPieceMovement;
    };
    RuleEnforcer.prototype.mockPieceCollision = function (uniqueId, index) {
        var id = this.rule.getUniqueIdCollision(uniqueId, index);
        var currentPlayer = this.scheduler.getCurrentPlayer();
        if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
            return true;
        }
        else {
            return false;
        }
    };
    RuleEnforcer.prototype.readAllMoves = function () {
        for (var _i = 0, _a = this.currentPossibleMovements.activeMoves; _i < _a.length; _i++) {
            var move = _a[_i];
            log.debug(this.rule.decodeMove(move));
        }
        for (var _b = 0, _c = this.currentPossibleMovements.homeMoves; _b < _c.length; _b++) {
            var move = _c[_b];
            log.debug(this.rule.decodeMove(move));
        }
        for (var _d = 0, _e = this.currentPossibleMovements.onWayOutMoves; _d < _e.length; _d++) {
            var move = _e[_d];
            log.debug(this.rule.decodeMove(move));
        }
        log.debug("+++++++++++++++++++++++++++++++++++++++++++++++++++++");
    };
    RuleEnforcer.prototype.addDiceValues = function (diceValues) {
        var value = 0;
        for (var _i = 0, diceValues_1 = diceValues; _i < diceValues_1.length; _i++) {
            var dieValue = diceValues_1[_i];
            value += dieValue;
        }
        return value;
    };
    RuleEnforcer.prototype.handleEmptyPossibleMovements = function () {
        var nextPlayer = this.scheduler.getNextPlayer();
        if (nextPlayer.isAI) {
            this.dice.setDicePlayerId(nextPlayer.playerId);
            if (emit.getEmit() === true) {
                this.signal.dispatch("aiRollDice", this.dice, nextPlayer.playerId);
            }
        }
    };
    RuleEnforcer.prototype.filterConsumeDieValueSixMovement = function (movement, piece) {
        if (piece.isAtHome()) {
            this.dice.consumeDieValueSix(movement.diceId);
            piece.index = piece.startIndex;
        }
        return movement;
    };
    RuleEnforcer.prototype.consumeDieMockValueSix = function (movement) {
        var ids = movement.diceId.split("#");
        if (ids.length === 2) {
            if (ids[0] === this.dice.dieOne.uniqueId && this.dice.dieOne.equalsValueSix()) {
                movement.mockDiceId = this.dice.dieTwo.uniqueId;
            }
            if (ids[1] === this.dice.dieTwo.uniqueId && this.dice.dieTwo.equalsValueSix()) {
                movement.mockDiceId = this.dice.dieOne.uniqueId;
            }
        }
        else if (ids.length === 1) {
            movement.mockConsumeDieValueSix = true;
            movement.mockDiceId = movement.diceId;
        }
        return movement;
    };
    RuleEnforcer.prototype.generateAllPossibleMoves = function (callback) {
        var currentPlayer = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements.resetMoves();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
        // log.debug("Possible Moves Generated: " + this.currentPossibleMovements.totalNumberOfRules());
        // this.rule.showRulePools();
        this.analyzeAllPossibleMove(currentPlayer, function (moveIsEmpty) {
            callback(moveIsEmpty);
        });
    };
    RuleEnforcer.prototype.analyzeAllPossibleMove = function (currentPlayer, callback) {
        /**
         * Corner case for when player can only play one active or home or onwayout piece.
         * This does not necessarily mean that the player has a total of one piece.
        */
        if (currentPlayer.allPiecesAreAtHome()) {
            this.currentPossibleMovements = this.filterOnAllPiecesAreAtHome(this.currentPossibleMovements, currentPlayer);
        }
        else if (currentPlayer.hasExactlyOneActivePiece()) {
            this.currentPossibleMovements = this.filterOnHasExactlyOneActivePiece(this.currentPossibleMovements, currentPlayer);
        }
        else if (!currentPlayer.hasActivePieces() && currentPlayer.hasHomePieces() &&
            this.dice.rolledAtLeastOneSix() && currentPlayer.hasOnWayOutPieces()) {
            this.currentPossibleMovements = this.filterOnNoActiveButHomeAndOnWayOutPieces(this.currentPossibleMovements, currentPlayer);
        }
        else if (currentPlayer.hasExactlyOnePieceLeft()) {
            if (this.moveContainTwoDice(this.currentPossibleMovements.activeMoves)) {
                this.currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(this.currentPossibleMovements.activeMoves);
            }
        }
        else {
        }
        // this.readAllMoves();
        callback(this.currentPossibleMovements.isEmpty());
    };
    RuleEnforcer.prototype.filterOnHasExactlyOneActivePiece = function (currentPossibleMovements, player) {
        /**
         * This block of code validates corner cases where a player has only one active piece
         * and has one or more onwayout pieces. This check is necessarily to prevent player
         * from playing an invalid die value on the active piece.
         */
        if (player.hasOnWayOutPieces()) {
            var onWayOutPieces = player.getPlayerOnWayOutPieces();
            var onWayOutPieceMovements = [];
            for (var _i = 0, onWayOutPieces_1 = onWayOutPieces; _i < onWayOutPieces_1.length; _i++) {
                var onWayOutPiece = onWayOutPieces_1[_i];
                onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId, currentPossibleMovements.onWayOutMoves));
            }
            // log.debug("Size: " + onWayOutPieceMovements.length);
            /** This checks corner case for when a player has one onwayout piece and one active piece
                Rule must ensure that player is not allowed to play die value on active piece leaving
                the other value that onwayout piece cannot play
            */
            if (onWayOutPieceMovements.length >= 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                if (this.dice.bothDiceHasLegitValues()) {
                    if ((this.homeManyShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves)) === 1) {
                        this.onwayoutShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves, true);
                    }
                }
            }
            else if (onWayOutPieceMovements.length === 0 && this.dice.bothDiceHasLegitValues() && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                // cond-009
                if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                    currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                }
            }
            else {
                // cond-007
                if (this.dice.bothDiceHasLegitValues() && this.dice.rolledAtLeastOneSix() && !this.dice.rolledDoubleSix()) {
                    if (player.hasHomePieces()) {
                        currentPossibleMovements.activeMoves = this.removeMoveWithDieValueSix(currentPossibleMovements.activeMoves);
                    }
                    else if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                        currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                    }
                }
                else {
                    if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                        currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                    }
                }
            }
        }
        else if (player.hasHomePieces()) {
            if (this.dice.rolledAtLeastOneSix() && !this.dice.rolledDoubleSix()) {
                currentPossibleMovements.activeMoves = this.removeMoveWithDieValueSix(currentPossibleMovements.activeMoves);
            }
            else {
                if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                    currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                }
            }
        }
        else {
            // tough call to make. Needs serious thought process
            if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
            }
        }
        return currentPossibleMovements;
    };
    RuleEnforcer.prototype.moveContainTwoDice = function (movements) {
        var containsTwoDice = false;
        for (var _i = 0, movements_1 = movements; _i < movements_1.length; _i++) {
            var movement = movements_1[_i];
            if ((movement.diceId.split("#")).length > 1) {
                containsTwoDice = true;
                break;
            }
        }
        return containsTwoDice;
    };
    RuleEnforcer.prototype.filterOnAllPiecesAreAtHome = function (currentPossibleMovements, player) {
        if (!player.hasActivePieces() && !this.dice.rolledDoubleSix()) {
            currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.homeMoves);
        }
        return currentPossibleMovements;
    };
    RuleEnforcer.prototype.filterOnNoActiveButHomeAndOnWayOutPieces = function (currentPossibleMovements, player) {
        var onWayOutPieces = player.getPlayerOnWayOutPieces();
        var onWayOutPieceMovements = [];
        for (var _i = 0, onWayOutPieces_2 = onWayOutPieces; _i < onWayOutPieces_2.length; _i++) {
            var onWayOutPiece = onWayOutPieces_2[_i];
            onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId, currentPossibleMovements.onWayOutMoves));
        }
        if (onWayOutPieceMovements.length === 0) {
            currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.homeMoves);
        }
        return currentPossibleMovements;
    };
    // Establish that onwayout movements has the same unique ids
    RuleEnforcer.prototype.diceIdsAreDistinct = function (onWayOutMovements) {
        var movement = onWayOutMovements[0];
        var distinctIds = true;
        for (var _i = 0, onWayOutMovements_1 = onWayOutMovements; _i < onWayOutMovements_1.length; _i++) {
            var m = onWayOutMovements_1[_i];
            if (m.diceId !== movement.diceId) {
                distinctIds = false;
                break;
            }
        }
        return distinctIds;
    };
    RuleEnforcer.prototype.onwayoutShareDiceWithActivePiece = function (onWayOutMovements, activeMovements, splice) {
        var sharedIds = false;
        for (var _i = 0, onWayOutMovements_2 = onWayOutMovements; _i < onWayOutMovements_2.length; _i++) {
            var onwayoutMovement = onWayOutMovements_2[_i];
            for (var x = 0; x < activeMovements.length; x++) {
                if (onwayoutMovement.diceId === activeMovements[x].diceId) {
                    sharedIds = true;
                    if (splice) {
                        var illegalMove = activeMovements[x];
                        // log.debug("7 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                        activeMovements.splice(x, 1);
                        this.rule.addSpentMoveBackToPool(illegalMove);
                    }
                }
            }
        }
        return sharedIds;
    };
    RuleEnforcer.prototype.homeManyShareDiceWithActivePiece = function (onWayOutMovements, activeMovements) {
        var sharedIds = 0;
        var matchinfDieId = "";
        for (var _i = 0, onWayOutMovements_3 = onWayOutMovements; _i < onWayOutMovements_3.length; _i++) {
            var onwayoutMovement = onWayOutMovements_3[_i];
            for (var x = 0; x < activeMovements.length; x++) {
                if ((onwayoutMovement.diceId === activeMovements[x].diceId) && (onwayoutMovement.diceId !== matchinfDieId)) {
                    matchinfDieId = onwayoutMovement.diceId;
                    ++sharedIds;
                }
            }
        }
        return sharedIds;
    };
    RuleEnforcer.prototype.getDieMovementsOnPiece = function (pieceId, movements) {
        var onWayOutPieceMovements = [];
        for (var _i = 0, movements_2 = movements; _i < movements_2.length; _i++) {
            var movement = movements_2[_i];
            if (movement.pieceId === pieceId) {
                onWayOutPieceMovements.push(movement);
            }
        }
        return onWayOutPieceMovements;
    };
    RuleEnforcer.prototype.checkCollision = function (uniqueId, index) {
        var id = this.rule.getUniqueIdCollision(uniqueId, index);
        return id;
    };
    RuleEnforcer.prototype.removeMoveWithSingleDieValues = function (movements) {
        var legalMoves = [];
        for (var x = 0; x < movements.length; ++x) {
            var illegalMove = movements[x];
            if ((movements[x].diceId.split("#")).length > 1) {
                legalMoves.push(movements[x]);
            }
            else {
                // log.debug("5 Successfully Removed illegal move: " + this.rule.decodeMove(movements[x]));
                this.rule.addSpentMoveBackToPool(illegalMove);
            }
        }
        return legalMoves;
    };
    RuleEnforcer.prototype.removeMoveWithDieValueSix = function (movements) {
        var diceId = this.dice.getDieUniqueIdByValue(6);
        var legalMoves = [];
        if (diceId !== null) {
            for (var x = 0; x < movements.length; x++) {
                if (movements[x].diceId !== diceId) {
                    legalMoves.push(movements[x]);
                }
                else {
                    var illegalMove = movements[x];
                    // log.debug("6 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                    this.rule.addSpentMoveBackToPool(illegalMove);
                }
            }
        }
        return legalMoves;
    };
    RuleEnforcer.prototype.onCompletePieceMovement = function (listener, piece) {
        var currentPlayer = this.scheduler.getCurrentPlayer();
        if (listener === "completeMovement" && currentPlayer.isAI) {
            this.currentPossibleMovements.resetMoves();
            this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
            if (!this.currentPossibleMovements.isEmpty()) {
                if (emit.getEmit()) {
                    this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
                }
            }
        }
    };
    RuleEnforcer.prototype.setStateChange = function (listener, piece) {
        if (listener === "startmovement") {
            if (emit.getEmit() === true && emit.getEnableSocket()) {
                this.emitPiece.setParameters(piece);
                this.signal.dispatch("setStateChangeLocal", this.emitPiece);
                this.socket.emit("setStateChange", this.emitPiece);
            }
        }
    };
    RuleEnforcer.prototype.emitPieceMovement = function (movement) {
        movement.gameId = this.gameId;
        this.socket.emit("pieceMovement", movement);
    };
    RuleEnforcer.prototype.emitAIPieceMovement = function (movement) {
        movement.gameId = this.gameId;
        this.socket.emit("aiPieceMovement", movement);
    };
    RuleEnforcer.prototype.setSocketHandlers = function () {
        var _this = this;
        this.socket.on("connect", function () {
            log.debug(_this.socket.id + "**Player is connected*****");
        });
        this.socket.on("emitRollDice", function (die) {
            if (emit.getEmit() === false) {
                // log.debug( " Emit receieved " + JSON.stringify(die));
                _this.emitDice.push(die);
                if (_this.emitDice.length > 1) {
                    _this.dice.rollEmitDice(_this.emitDice[0], _this.emitDice[1]);
                    _this.emitDice = [];
                }
            }
            else {
            }
        });
        this.socket.on("emitSelectActivePiece", function (emitPiece) {
            if (emit.getEmit() === false) {
                _this.scheduler.getCurrentPlayer().emitSelectCurrentPiece(emitPiece.uniqueId);
            }
            // log.debug("Select piece: " + emitPiece.uniqueId);
        });
        this.socket.on("emitPieceMovement", function (movement) {
            if (emit.getEmit() === false) {
                var piece = _this.scheduler.getPieceByUniqueId(movement.pieceId);
                if (piece) {
                    var diceUniqueIds = movement.diceId.split("#");
                    // log.debug("Playing dice values: " + diceUniqueIds.join());
                    _this.generatePieceMovement(diceUniqueIds, piece);
                }
                else {
                    log.debug("Error finding piece: " + movement.pieceId);
                }
            }
            // log.debug("Play movement on : " + movement.pieceId);
        });
        this.socket.on("emitAIPieceMovement", function (movement) {
            if (emit.getEmit() === false) {
                var piece = _this.scheduler.getPieceByUniqueId(movement.pieceId);
                if (piece) {
                    // log.debug("Playing dice values: " + movement.pieceId);
                    _this.generateAIPieceMovement(piece, movement);
                }
                else {
                    log.debug("Error finding piece: " + movement.pieceId);
                }
            }
            // log.debug("Play movement on : " + movement.pieceId);
        });
        this.socket.on("emitChangePlayer", function (ludoplayers) {
            if (emit.getEmit() === false) {
                _this.dice.consumeWithoutEmission();
            }
        });
    };
    return RuleEnforcer;
}());
exports.RuleEnforcer = RuleEnforcer;
