"use strict";
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Actions_1 = require("../enums/Actions");
var HomeRules_1 = require("./HomeRules");
var ActiveRules_1 = require("./ActiveRules");
var OnWayOutRules_1 = require("./OnWayOutRules");
var ExitedRules_1 = require("./ExitedRules");
var States_1 = require("../enums/States");
var AllPossibleMoves_1 = require("./AllPossibleMoves");
var log = ConfigLog4j_1.factory.getLogger("model.Rules");
var Rules = (function () {
    function Rules(signal, schedule, dice, activeBoard, homeBoard, onWayOutBoard, exitedBoard) {
        this.rollCounter = 0;
        this.activeMove = new ActiveRules_1.ActiveRules(dice, schedule, activeBoard);
        this.homeMove = new HomeRules_1.HomeRules(dice, schedule, homeBoard);
        this.onWayOutMove = new OnWayOutRules_1.OnWayOutRules(dice, schedule, onWayOutBoard);
        this.exitedMove = new ExitedRules_1.ExitedRules(dice, schedule, exitedBoard);
        this.schedule = schedule;
        this.signal = signal;
        this.dice = dice;
        this.allPossibleMoves = new AllPossibleMoves_1.AllPossibleMoves();
    }
    Rules.prototype.getOnWayOutBoard = function () {
        return this.onWayOutMove.getBoard();
    };
    Rules.prototype.getActiveBoard = function () {
        return this.activeMove.getBoard();
    };
    Rules.prototype.getHomeBoard = function () {
        return this.homeMove.getBoard();
    };
    Rules.prototype.generateAllPossibleMoves = function (player) {
        this.allPossibleMoves.activeMoves = this.activeMove.generateMoves(player);
        this.allPossibleMoves.homeMoves = this.homeMove.generateMoves(player);
        this.allPossibleMoves.onWayOutMoves = this.onWayOutMove.generateMoves(player);
        return this.allPossibleMoves;
    };
    Rules.prototype.generatePieceMovement = function (dieUniqueIds, piece) {
        switch (piece.state) {
            case States_1.States.Active:
                return this.activeMove.generateActivePieceMovement(dieUniqueIds, piece);
            case States_1.States.AtHome:
                return this.homeMove.generateHomePieceMovement(dieUniqueIds, piece);
            case States_1.States.onWayOut:
                return this.onWayOutMove.generateOnWayOutPieceMovement(dieUniqueIds, piece);
            default:
                return null;
        }
    };
    Rules.prototype.addSpentMovesBackToPool = function (moves) {
        var activeMoves = [];
        var homeMoves = [];
        var onWayOutMoves = [];
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var move = moves_1[_i];
            if (move.state === States_1.States.Active) {
                activeMoves.push(move);
            }
            else if (move.state === States_1.States.AtHome) {
                homeMoves.push(move);
            }
            else if (move.state === States_1.States.onWayOut) {
                onWayOutMoves.push(move);
            }
        }
        if (activeMoves.length > 0) {
            this.activeMove.addSpentRulesBackToPool(activeMoves);
        }
        if (homeMoves.length > 0) {
            this.homeMove.addSpentRulesBackToPool(homeMoves);
        }
        if (onWayOutMoves.length > 0) {
            this.onWayOutMove.addSpentRulesBackToPool(moves);
        }
    };
    Rules.prototype.addSpentMoveBackToPool = function (move) {
        if (move.state === States_1.States.Active) {
            this.activeMove.addToRulePool(move);
        }
        else if (move.state === States_1.States.AtHome) {
            this.homeMove.addToRulePool(move);
        }
        else if (move.state === States_1.States.onWayOut) {
            this.onWayOutMove.addToRulePool(move);
        }
    };
    Rules.prototype.getUniqueIdCollision = function (uniqueId, index) {
        return this.activeMove.getUniqueIdCollision(uniqueId, index);
    };
    Rules.prototype.decodeMove = function (move) {
        switch (move.state) {
            case States_1.States.Active:
                return this.decodeActiveMove(move);
            case States_1.States.AtHome:
                return this.decodeHomeMove(move);
            case States_1.States.onWayOut:
                return this.decodeOnWayOutMove(move);
            default:
                return "Unexpected";
        }
    };
    Rules.prototype.checkBoardConsistencies = function () {
        var activePieces = this.activeMove.getBoard().board.size();
        var homePieces = this.homeMove.getBoard().board.size();
        var onWayOutPieces = this.onWayOutMove.getBoard().board.size();
        var exitedPieces = this.exitedMove.getBoard().board.size();
        var totalPieces = activePieces + homePieces + onWayOutPieces + exitedPieces;
        var playerActivePieces = 0;
        var playerHomePieces = 0;
        var playerOnwayoutPieces = 0;
        var playerExitPieces = 0;
        for (var _i = 0, _a = this.schedule.players; _i < _a.length; _i++) {
            var player = _a[_i];
            playerActivePieces += player.activePieceCount();
            playerHomePieces += player.homePieceCount();
            playerOnwayoutPieces += player.onwayoutCount();
            playerExitPieces += player.exitPieceCount();
        }
        if (totalPieces !== 16) {
            log.debug("Total Pieces mismatch!!! active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
        }
        else {
            log.debug("active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
        }
        if (playerActivePieces === activePieces && playerHomePieces === homePieces && playerOnwayoutPieces === onWayOutPieces && playerExitPieces === exitedPieces) {
        }
        else {
            log.debug("MISMATCH!!!!!!!!!: " + +this.schedule.players.length);
            log.debug("active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
            log.debug("active: " + playerActivePieces + " home: " + playerHomePieces + " onwayOut: " + playerOnwayoutPieces + " exited: " + playerExitPieces);
        }
    };
    Rules.prototype.showRulePools = function () {
        log.debug("<Active> RulePool: " + this.activeMove.rulesPool.length + " ActiveRulePool " + this.activeMove.activeRulePool.length);
        log.debug("<Home> RulePool: " + this.homeMove.rulesPool.length + " ActiveRoolPool " + this.homeMove.activeRulePool.length);
        log.debug("<OnWayOut> RulePool: " + this.onWayOutMove.rulesPool.length + " ActiveRulePool " + this.onWayOutMove.activeRulePool.length);
        log.debug("----------------------------------------------------------------------");
    };
    Rules.prototype.updateBoards = function (ludopieces) {
        for (var _i = 0, ludopieces_1 = ludopieces; _i < ludopieces_1.length; _i++) {
            var piece = ludopieces_1[_i];
            switch (piece.state) {
                case States_1.States.AtHome: {
                    this.homeMove.getBoard().board.setValue(piece.uniqueId, piece.index);
                    break;
                }
                case States_1.States.Active: {
                    this.activeMove.getBoard().board.setValue(piece.uniqueId, piece.index);
                    break;
                }
                case States_1.States.onWayOut: {
                    this.onWayOutMove.getBoard().board.setValue(piece.uniqueId, piece.index);
                    break;
                }
                case States_1.States.Exited: {
                    this.exitedMove.getBoard().board.setValue(piece.uniqueId, piece.index);
                    break;
                }
            }
        }
    };
    Rules.prototype.decodeActiveMove = function (move) {
        if (move.action === Actions_1.Actions.DO_NOTHING) {
            return "DO NOTHING";
        }
        else if (move.action === Actions_1.Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.PLAY) {
            return "ACTIVE PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.ROLL) {
            return "ROLL";
        }
        else if (move.action === Actions_1.Actions.SKIP) {
            return "ACTIVE SKIP";
        }
        else {
            return "DO NOTHING";
        }
    };
    Rules.prototype.decodeHomeMove = function (move) {
        if (move.action === Actions_1.Actions.DO_NOTHING) {
            return "DO NOTHING";
        }
        else if (move.action === Actions_1.Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.PLAY) {
            return "HOME PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.ROLL) {
            return "ROLL";
        }
        else if (move.action === Actions_1.Actions.SKIP) {
            return "HOME SKIP";
        }
        else {
            return "DO NOTHING";
        }
    };
    Rules.prototype.decodeOnWayOutMove = function (move) {
        if (move.action === Actions_1.Actions.DO_NOTHING) {
            return "DO NOTHING";
        }
        else if (move.action === Actions_1.Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.PLAY) {
            return "ONWAYOUT PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }
        else if (move.action === Actions_1.Actions.ROLL) {
            return "ROLL";
        }
        else if (move.action === Actions_1.Actions.SKIP) {
            return "ONWAYOUT SKIP";
        }
        else {
            return "DO NOTHING";
        }
    };
    return Rules;
}());
exports.Rules = Rules;
