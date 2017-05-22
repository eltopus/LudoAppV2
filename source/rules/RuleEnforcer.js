"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rules_1 = require("../rules/Rules");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.RuleEnforcer");
var RuleEnforcer = (function () {
    function RuleEnforcer(signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard, currentPossibleMovements) {
        this.rollCounter = 0;
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules_1.Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
        this.signal.add(this.onCompletePieceMovement, this, 0, "completeMovement");
    }
    RuleEnforcer.prototype.setRollCounter = function (rollCounter) {
        this.rollCounter = rollCounter;
    };
    RuleEnforcer.prototype.endOfDiceRoll = function (listener) {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.currentPossibleMovements.resetMoves();
                this.generateAllPossibleMoves();
                var currentPlayer = this.scheduler.getCurrentPlayer();
                if (this.dice.rolledDoubleSix()) {
                    currentPlayer.previousDoubleSix = true;
                }
                if (currentPlayer.isAI) {
                    this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
                }
            }
        }
    };
    RuleEnforcer.prototype.generatePieceMovement = function (dieIds, piece) {
        var pieceMovement = this.rule.generatePieceMovement(dieIds, piece);
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
                    if (piece.isActive()) {
                        var id = this.checkCollision(piece.uniqueId, piece.index);
                        if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                            var backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                            if (backToHomePiece !== null) {
                                backToHomePiece.setAtHome();
                                piece.collidingPiece = backToHomePiece;
                                piece.setExited();
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
            this.currentPossibleMovements.resetMoves();
            this.generateAllPossibleMoves();
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
        aiPieceMovement = this.filterConsumeDieValueSixMovement(aiPieceMovement, piece);
        var currentPlayer = this.scheduler.getCurrentPlayer();
        var diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(aiPieceMovement.diceId));
        this.dice.consumeDieValueById(aiPieceMovement.diceId);
        var path = piece.constructPath(diceValue);
        if (!path.isEmpty()) {
            piece.index = path.newIndex;
            if (piece.isActive()) {
                var id = this.checkCollision(piece.uniqueId, piece.index);
                if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                    var backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                    if (backToHomePiece !== null) {
                        backToHomePiece.setAtHome();
                        piece.collidingPiece = backToHomePiece;
                        piece.setExited();
                    }
                }
            }
            piece.movePiece(path);
        }
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
        this.currentPossibleMovements.resetMoves();
        this.generateAllPossibleMoves();
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
            this.signal.dispatch("aiRollDice", this.dice, nextPlayer.playerId);
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
    RuleEnforcer.prototype.generateAllPossibleMoves = function () {
        var currentPlayer = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements.resetMoves();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
        this.analyzeAllPossibleMove(currentPlayer);
    };
    RuleEnforcer.prototype.analyzeAllPossibleMove = function (currentPlayer) {
        var _this = this;
        if (this.currentPossibleMovements.isEmpty()) {
            setTimeout(function () {
                _this.handleEmptyPossibleMovements();
            }, 1000);
        }
        else {
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
        }
    };
    RuleEnforcer.prototype.filterOnHasExactlyOneActivePiece = function (currentPossibleMovements, player) {
        if (player.hasOnWayOutPieces()) {
            var onWayOutPieces = player.getPlayerOnWayOutPieces();
            var onWayOutPieceMovements = [];
            for (var _i = 0, onWayOutPieces_1 = onWayOutPieces; _i < onWayOutPieces_1.length; _i++) {
                var onWayOutPiece = onWayOutPieces_1[_i];
                onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId, currentPossibleMovements.onWayOutMoves));
            }
            if (onWayOutPieceMovements.length >= 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                if (this.dice.bothDiceHasLegitValues()) {
                    if ((this.homeManyShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves)) === 1) {
                        this.onwayoutShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves, true);
                    }
                }
            }
            else if (onWayOutPieceMovements.length === 0 && this.dice.bothDiceHasLegitValues() && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                    currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                }
            }
            else {
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
        if (!player.hasActivePieces()) {
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
                this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
            }
        }
    };
    return RuleEnforcer;
}());
exports.RuleEnforcer = RuleEnforcer;
