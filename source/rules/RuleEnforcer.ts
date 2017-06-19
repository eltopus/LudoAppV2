// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import { Scheduler } from "../rules/Scheduler";
import { Rules } from "../rules/Rules";
import { Player } from "../entities/Player";
import { AIPlayer } from "../entities/AIPlayer";
import { Piece } from "../entities/Piece";
import { Move } from "./Move";
import { Board } from "../entities/Board";
import { Dice } from "../entities/Dice";
import { ActiveBoard } from "../entities/ActiveBoard";
import { HomeBoard } from "../entities/HomeBoard";
import { OnWayOutBoard } from "../entities/OnWayOutBoard";
import { ExitedBoard } from "../entities/ExitedBoard";
import { factory } from "../logging/ConfigLog4j";
import { AllPossibleMoves } from "./AllPossibleMoves";
import { Path } from "../entities/Path";
import { Perimeter } from "../entities/Perimeters";
import { EmitDie } from "../emit/EmitDie";
import { EmitPiece } from "../emit/EmitPiece";
import { Emit } from "../emit/Emit";
import { LudoPlayer } from "../game/LudoPlayer";
import { LudoGame } from "../game/LudoGame";
import * as Paths from "../entities/Paths";
declare var Example: any;
declare var bootbox: any;
let emit = Emit.getInstance();
let Display = Example;
const log = factory.getLogger("model.RuleEnforcer");

let timecalled = 0;

export class RuleEnforcer {
    public rule: Rules;
    public scheduler: Scheduler;
    public dice: Dice;
    public isCreator = false;
    public players: Player[] = [];
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private emitRollCounter = 0;
    private currentPossibleMovements: AllPossibleMoves;
    private emitDie = new EmitDie();
    private emitDice: EmitDie[] = [];
    private gameId: string;
    private socket: any;
    private emitPiece: EmitPiece = new EmitPiece();
    private activepath = new Paths.ActivePath();
    private onwayoutpath = new Paths.OnWayOutPaths();
    private winningPlayer: Player = null;

    constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeboard: ActiveBoard,
        homeboard: HomeBoard, onWayOutBoard: OnWayOutBoard, exitedBoard: ExitedBoard, gameId: string, socket: any, currentPossibleMovements?: AllPossibleMoves) {
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.gameId = gameId;
        this.socket = socket;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
        this.signal.add(this.onCompletePieceMovement, this, 0, "completeMovement");
        this.signal.add(this.setStateChange, this, 0, "setStateChange");
        this.emitDie.gameId = gameId;
        if (emit.getEnableSocket()) {
            this.setSocketHandlers();
        }

    }

    public setRollCounter(rollCounter: number): void {
        this.rollCounter = rollCounter;
    }

    public setPlayers(player: Player): void {
        this.players.push(player);
    }

    public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.generateAllPossibleMoves((moveIsEmpty: boolean) => {
                    if (moveIsEmpty) {
                        setTimeout(() => this.handleEmptyPossibleMovements(), 1000);
                    } else {
                        let currentPlayer = this.scheduler.getCurrentPlayer();
                        if (this.dice.rolledDoubleSix()) {
                            currentPlayer.previousDoubleSix = true;
                        }
                        if (currentPlayer.isAI) {
                            if (emit.getEmit()) {
                                this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
                            }
                        }
                        this.rule.checkBoardConsistencies();
                    }
                });
            }
        }
    }

    /**
     * Generates move object using selected piece and selected die or dice
     * @param dieIds
     * @param piece
     */
    public generatePieceMovement(dieIds: string[], piece: Piece): Move {
        let pieceMovement = this.rule.generatePieceMovement(dieIds, piece);
        let canPlay = false;
        let possibleMovements = this.currentPossibleMovements.getPieceMoves(piece.state);
        let currentPlayer = this.scheduler.getCurrentPlayer();
        for (let movement of possibleMovements) {
            if (movement.compare(pieceMovement)) {
                if (emit.getEmit() && emit.getEnableSocket()) {
                    this.emitAIPieceMovement(pieceMovement);
                }
                canPlay = true;
                movement = this.filterConsumeDieValueSixMovement(movement, piece);
                let diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(movement.diceId));
                this.dice.consumeDieValueById(movement.diceId);
                let path: Path = piece.constructPath(diceValue);
                if (!path.isEmpty()) {
                    piece.index = path.newIndex;
                    // Condition for collision or peck
                    if (piece.isActive()) {
                        let id = this.checkCollision(piece.uniqueId, piece.index);
                        if (id !== "NOTFOUND") {
                            let backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                            if (backToHomePiece && !currentPlayer.pieceBelongsToMe(backToHomePiece.playerId)) {
                                backToHomePiece.setAtHome();
                                if (emit.getEmit() === true) {
                                    this.emitPiece.setParameters(backToHomePiece);
                                    this.emitPiece.index = -1;
                                    this.socket.emit("setBackToHome", this.emitPiece);
                                } else if (emit.getEnableSocket() === false) {
                                    this.emitPiece.setParameters(backToHomePiece);
                                    this.emitPiece.index = -1;
                                    this.signal.dispatch("setBackToHomeLocal", this.emitPiece);
                                }
                                piece.collidingPiece = backToHomePiece.uniqueId;
                                if (emit.getPeckAndStay() === false) {
                                    piece.setExited();
                                }
                            }
                        }
                    }
                    piece.movePiece(path);
                    break;
                } else {
                    log.debug("I don't know what to do...............");
                    break;
                }
            }
        }
        if (canPlay) {
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
            this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
            this.generateAllPossibleMoves((moveIsEmpty: boolean) => {
                if (moveIsEmpty) {
                    setTimeout(() => this.handleEmptyPossibleMovements(), 1000);
                }
            });
        } else {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
            Display.show("Illegal Move!!! Please try again");
        }
        return pieceMovement;
    }

    public getPieceByUniqueId(uniqueId: string): Piece {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    }


    public generateAIPieceMovement(piece: Piece, aiPieceMovement: Move): Move {
        if (emit.getEmit() && emit.getEnableSocket()) {
            this.emitAIPieceMovement(aiPieceMovement);
        }
        aiPieceMovement = this.filterConsumeDieValueSixMovement(aiPieceMovement, piece);
        let currentPlayer = this.scheduler.getCurrentPlayer();
        let diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(aiPieceMovement.diceId));
        this.dice.consumeDieValueById(aiPieceMovement.diceId);
        let path: Path = piece.constructPath(diceValue);
        if (!path.isEmpty()) {
            piece.index = path.newIndex;
            // Condition for collision or peck
            if (piece.isActive()) {
                let id = this.checkCollision(piece.uniqueId, piece.index);
                if (id !== "NOTFOUND") {
                    let backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                    if (backToHomePiece && !currentPlayer.pieceBelongsToMe(backToHomePiece.playerId)) {
                        backToHomePiece.setAtHome();
                        if (emit.getEmit() === true) {
                            this.emitPiece.setParameters(backToHomePiece);
                            this.emitPiece.index = -1;
                            this.socket.emit("setBackToHome", this.emitPiece);
                        } else if (emit.getEnableSocket() === false) {
                            this.emitPiece.setParameters(backToHomePiece);
                            this.emitPiece.index = -1;
                            this.signal.dispatch("setBackToHomeLocal", this.emitPiece);
                        }
                        piece.collidingPiece = backToHomePiece.uniqueId;
                        if (emit.getPeckAndStay() === false) {
                            piece.setExited();
                        }
                    }
                }
            }
            piece.movePiece(path);
        }
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
        this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
        this.generateAllPossibleMoves((moveIsEmpty: boolean) => {
            if (moveIsEmpty) {
                setTimeout(() => this.handleEmptyPossibleMovements(), 1000);
            }
        });
        return aiPieceMovement;
    }

    public mockPieceCollision(uniqueId: string, index: number): boolean {
        let id = this.rule.getUniqueIdCollision(uniqueId, index);
        let currentPlayer = this.scheduler.getCurrentPlayer();
        if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
            return true;
        } else {
            return false;
        }
    }

    public readAllMoves(): void {
        for (let move of this.currentPossibleMovements.activeMoves) {
            log.debug(this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.homeMoves) {
            log.debug(this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.onWayOutMoves) {
            log.debug(this.rule.decodeMove(move));
        }
        log.debug("+++++++++++++++++++++++++++++++++++++++++++++++++++++");
    }

    public addDiceValues(diceValues: number[]): number {
        let value = 0;
        for (let dieValue of diceValues) {
            value += dieValue;
        }
        return value;
    }

    public handleEmptyPossibleMovements(): void {
        let currentPlayer = this.scheduler.getCurrentPlayer();
        if (currentPlayer.wins()) {
            this.winningPlayer = currentPlayer;
        } else {
            let nextPlayer = this.scheduler.getNextPlayer();
            this.emitChangePlayer(nextPlayer);
        }
    }

    public emitChangePlayer(nextPlayer: Player): void {
        emit.setEmit(false);
        this.socket.emit("changePlayer", this.gameId, nextPlayer.playerId, (currentplayerId: string, serverIndexTotal: number) => {
            emit.checkPlayerId(currentplayerId);
            let clientIndexTotal = this.getIndexTotal();
            if (clientIndexTotal !== serverIndexTotal) {
                if (emit.getEmit() === true || emit.isAdmin()) {
                    Display.show(`Synchronizing with server... ${clientIndexTotal} not equal ${serverIndexTotal}`);
                    log.debug(`Synchronizing with server... ${clientIndexTotal} not equal ${serverIndexTotal}`);
                    this.socket.emit("updateGame", this.gameId, (ludogame: LudoGame) => {
                        // log.debug(JSON.stringify(ludogame));
                        if (ludogame.gameId) {
                            this.scheduler.resetScheduler();
                            this.rule.clearBoards();
                            for (let player of this.players) {
                                player.updateOnReloadLudoPieces(ludogame);
                                this.rule.updateOnRestartBoards(player.pieces);
                                this.scheduler.enqueue(player);
                            }
                        }
                        if (nextPlayer.isAI && emit.isAdmin() === false) {
                            this.signal.dispatch("aiRollDice", this.dice, nextPlayer.playerId);
                        }
                    });
                } else {
                    // Display.show(`Game out of synch.. ${clientIndexTotal} not equal ${serverIndexTotal}`);
                    log.debug(`Game out of synch.. ${clientIndexTotal} not equal ${serverIndexTotal}`);
                }
            } else {
                // log.debug("After ChangePlayerId: " + emit.getCurrentPlayerId() + " nextPlayerId: " + currentplayerId + " emit: " + emit.getEmit());
                if (nextPlayer.isAI && emit.getEmit()) {
                    this.signal.dispatch("aiRollDice", this.dice, nextPlayer.playerId);
                }
            }
        });

    }

    public filterConsumeDieValueSixMovement(movement: Move, piece: Piece): Move {
        if (piece.isAtHome()) {
            this.dice.consumeDieValueSix(movement.diceId);
            piece.index = piece.startIndex;
        }
        return movement;
    }

    public consumeDieMockValueSix(movement: Move): Move {
        let ids = movement.diceId.split("#");
        if (ids.length === 2) {
            if (ids[0] === this.dice.dieOne.uniqueId && this.dice.dieOne.equalsValueSix()) {
                movement.mockDiceId = this.dice.dieTwo.uniqueId;
            }
            if (ids[1] === this.dice.dieTwo.uniqueId && this.dice.dieTwo.equalsValueSix()) {
                movement.mockDiceId = this.dice.dieOne.uniqueId;
            }
        } else if (ids.length === 1) {
            movement.mockConsumeDieValueSix = true;
            movement.mockDiceId = movement.diceId;
        }
        return movement;
    }

    public getIndexTotal(): number {
        let indexTotal = 0;
        for (let player of this.players) {
            for (let piece of player.pieces) {
                if (piece.isActive() || piece.isAtHome() || piece.isOnWayOut()) {
                    indexTotal += piece.index;
                }
            }
        }
        // log.debug("Total from player is " + indexTotal);
        return indexTotal;
    }

    private generateAllPossibleMoves(callback: any): void {
        let currentPlayer: Player = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements.resetMoves();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
        // log.debug("Possible Moves Generated: " + this.currentPossibleMovements.totalNumberOfRules());
        // this.rule.showRulePools();
        this.analyzeAllPossibleMove(currentPlayer, (moveIsEmpty: boolean) => {
            callback(moveIsEmpty);
        });
    }

    private analyzeAllPossibleMove(currentPlayer: Player, callback: any): void {
        /**
         * Corner case for when player can only play one active or home or onwayout piece.
         * This does not necessarily mean that the player has a total of one piece.
        */
        if (currentPlayer.allPiecesAreAtHome()) {
            this.currentPossibleMovements = this.filterOnAllPiecesAreAtHome(this.currentPossibleMovements, currentPlayer);
        } else if (currentPlayer.hasExactlyOneActivePiece()) {
            this.currentPossibleMovements = this.filterOnHasExactlyOneActivePiece(this.currentPossibleMovements, currentPlayer);
        } else if (!currentPlayer.hasActivePieces() && currentPlayer.hasHomePieces() &&
            this.dice.rolledAtLeastOneSix() && currentPlayer.hasOnWayOutPieces()) {
            this.currentPossibleMovements = this.filterOnNoActiveButHomeAndOnWayOutPieces(this.currentPossibleMovements, currentPlayer);
        } else if (currentPlayer.hasExactlyOnePieceLeft()) {
            if (this.moveContainTwoDice(this.currentPossibleMovements.activeMoves)) {
                this.currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(this.currentPossibleMovements.activeMoves);
            }
        } else {
            // log.debug("NO FILTER LOGIC APPLIED...................................");
        }
        // this.readAllMoves();
        callback(this.currentPossibleMovements.isEmpty());
    }

    private filterOnHasExactlyOneActivePiece(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
        /**
         * This block of code validates corner cases where a player has only one active piece
         * and has one or more onwayout pieces. This check is necessarily to prevent player
         * from playing an invalid die value on the active piece.
         */
        if (player.hasOnWayOutPieces()) {
            let onWayOutPieces = player.getPlayerOnWayOutPieces();
            let onWayOutPieceMovements: Move[] = [];
            for (let onWayOutPiece of onWayOutPieces) {
                onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId,
                    currentPossibleMovements.onWayOutMoves));
            }
            // log.debug("Size: " + onWayOutPieceMovements.length);
            /** This checks corner case for when a player has one onwayout piece and one active piece
                Rule must ensure that player is not allowed to play die value on active piece leaving
                the other value that onwayout piece cannot play
            */
            if (onWayOutPieceMovements.length >= 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) { // cond-004
                if (this.dice.bothDiceHasLegitValues()) {
                    if ((this.homeManyShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves)) === 1) {
                        this.onwayoutShareDiceWithActivePiece(this.currentPossibleMovements.onWayOutMoves, this.currentPossibleMovements.activeMoves, true);
                    }
                }
                // cond-005
            } else if (onWayOutPieceMovements.length === 0 && this.dice.bothDiceHasLegitValues() && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                // cond-009
                if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                    currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                }
            } else {
                // cond-007
                if (this.dice.bothDiceHasLegitValues() && this.dice.rolledAtLeastOneSix() && !this.dice.rolledDoubleSix()) { // cond-008
                    if (player.hasHomePieces()) { // cond-010
                        currentPossibleMovements.activeMoves = this.removeMoveWithDieValueSix(currentPossibleMovements.activeMoves);
                    } else if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) { // cond-011
                        currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                    }
                } else { // cond-012
                    if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                        currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                    }
                }
            }
        } else if (player.hasHomePieces()) {
            if (this.dice.rolledAtLeastOneSix() && !this.dice.rolledDoubleSix()) {
                currentPossibleMovements.activeMoves = this.removeMoveWithDieValueSix(currentPossibleMovements.activeMoves);
            } else { // cond-002
                if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                    currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
                }
            }
        } else {
            // tough call to make. Needs serious thought process
            if (this.moveContainTwoDice(currentPossibleMovements.activeMoves)) {
                currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
            }
        }
        return currentPossibleMovements;
    }

    private moveContainTwoDice(movements: Move[]): boolean {
        let containsTwoDice = false;
        for (let movement of movements) {
            if ((movement.diceId.split("#")).length > 1) {
                containsTwoDice = true;
                break;
            }
        }
        return containsTwoDice;
    }

    private filterOnAllPiecesAreAtHome(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
        if (!player.hasActivePieces() && !this.dice.rolledDoubleSix()) {
            currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.homeMoves);
        }
        return currentPossibleMovements;
    }

    private filterOnNoActiveButHomeAndOnWayOutPieces(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
        let onWayOutPieces = player.getPlayerOnWayOutPieces();
        let onWayOutPieceMovements: Move[] = [];
        for (let onWayOutPiece of onWayOutPieces) {
            onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId,
                currentPossibleMovements.onWayOutMoves));
        }
        if (onWayOutPieceMovements.length === 0) {
            currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.homeMoves);
        }
        return currentPossibleMovements;

    }

    // Establish that onwayout movements has the same unique ids
    private diceIdsAreDistinct(onWayOutMovements: Move[]): boolean {
        let movement = onWayOutMovements[0];
        let distinctIds = true;
        for (let m of onWayOutMovements) {
            if (m.diceId !== movement.diceId) {
                distinctIds = false;
                break;
            }
        }
        return distinctIds;

    }

    private onwayoutShareDiceWithActivePiece(onWayOutMovements: Move[], activeMovements: Move[], splice: boolean): boolean {
        let sharedIds = false;
        for (let onwayoutMovement of onWayOutMovements) {
            for (let x = 0; x < activeMovements.length; x++) {
                if (onwayoutMovement.diceId === activeMovements[x].diceId) {
                    sharedIds = true;
                    if (splice) {
                        let illegalMove = activeMovements[x];
                        // log.debug("7 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                        activeMovements.splice(x, 1);
                        this.rule.addSpentMoveBackToPool(illegalMove);
                    }
                }
            }
        }
        return sharedIds;
    }

    private homeManyShareDiceWithActivePiece(onWayOutMovements: Move[], activeMovements: Move[]): number {
        let sharedIds = 0;
        let matchinfDieId = "";
        for (let onwayoutMovement of onWayOutMovements) {
            for (let x = 0; x < activeMovements.length; x++) {
                if ((onwayoutMovement.diceId === activeMovements[x].diceId) && (onwayoutMovement.diceId !== matchinfDieId)) {
                    matchinfDieId = onwayoutMovement.diceId;
                    ++sharedIds;
                }
            }
        }
        return sharedIds;
    }

    private getDieMovementsOnPiece(pieceId: string, movements: Move[]): Move[] {
        let onWayOutPieceMovements: Move[] = [];
        for (let movement of movements) {
            if (movement.pieceId === pieceId) {
                onWayOutPieceMovements.push(movement);
            }
        }
        return onWayOutPieceMovements;
    }

    private checkCollision(uniqueId: string, index: number): string {
        let id = this.rule.getUniqueIdCollision(uniqueId, index);
        return id;
    }

    private removeMoveWithSingleDieValues(movements: Move[]): Move[] {
        let legalMoves: Move[] = [];
        for (let x = 0; x < movements.length; ++x) {
            let illegalMove = movements[x];
            if ((movements[x].diceId.split("#")).length > 1) {
                legalMoves.push(movements[x]);
            } else {
                // log.debug("5 Successfully Removed illegal move: " + this.rule.decodeMove(movements[x]));
                this.rule.addSpentMoveBackToPool(illegalMove);
            }
        }
        return legalMoves;
    }

    private removeMoveWithDieValueSix(movements: Move[]): Move[] {
        let diceId = this.dice.getDieUniqueIdByValue(6);
        let legalMoves: Move[] = [];
        if (diceId !== null) {
            for (let x = 0; x < movements.length; x++) {
                if (movements[x].diceId !== diceId) {
                    legalMoves.push(movements[x]);
                } else {
                    let illegalMove = movements[x];
                    // log.debug("6 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                    this.rule.addSpentMoveBackToPool(illegalMove);
                }
            }
        }
        return legalMoves;
    }

    private onCompletePieceMovement(listener: string, piece: Piece): void {
        if (listener === "completeMovement" && this.scheduler.weHaveAWinningPlayer()) {
            log.debug(`Times called wins!!! + ${++timecalled}`);
            Display.show(`Player  wins!!!`);
            if (this.isCreator === true) {
                this.restartGame();
            }
        } else {
            let currentPlayer = this.scheduler.getCurrentPlayer();
            if (listener === "completeMovement" && currentPlayer.isAI) {
                this.currentPossibleMovements.resetMoves();
                this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
                if (!this.currentPossibleMovements.isEmpty()) {
                    if (emit.getEmit()) {
                        this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
                    }
                }
            }
        }
    }

    private restartGame(): void {
        this.socket.emit("restartGame", (ludogame: LudoGame) => {
            if (ludogame.gameId) {
                this.dice.consumeWithoutEmission();
                emit.checkPlayerId(ludogame.ludoPlayers[0].playerId);
                this.scheduler.resetScheduler();
                this.players.sort((a: Player, b: Player) => {
                    if (a.sequenceNumber < b.sequenceNumber) {
                        return -1;
                    }
                    if (a.sequenceNumber > b.sequenceNumber) {
                        return 1;
                    }
                    return 0;
                });
                this.rule.clearBoards();
                for (let player of this.players) {
                    player.updateOnRestartLudoPieces(ludogame);
                    this.rule.updateOnRestartBoards(player.pieces);
                    this.scheduler.enqueue(player);
                }
            }
            this.rule.checkBoardConsistencies();
            let currentPlayer = this.scheduler.getCurrentPlayer();
            if (currentPlayer.isAI && emit.isAdmin() === false) {
                this.signal.dispatch("aiRollDice", this.dice, currentPlayer.playerId);
            }
        });
    }

    private setStateChange(listener: string, piece: Piece): void {
        if (listener === "startmovement") {
            if (emit.getEmit() === true) {
                this.emitPiece.setParameters(piece);
                this.socket.emit("setStateChange", this.emitPiece);
            } else if (emit.getEnableSocket() === false) {
                this.emitPiece.setParameters(piece);
                this.signal.dispatch("setStateChangeLocal", this.emitPiece);
            }
        }
    }

    private emitPieceMovement(movement: Move): void {
        movement.gameId = this.gameId;
        this.socket.emit("pieceMovement", movement);
    }

    private emitAIPieceMovement(movement: Move): void {
        movement.gameId = this.gameId;
        this.socket.emit("aiPieceMovement", movement);
    }

    private displayMessage(message: string, title: string): void {
        bootbox.dialog({
                buttons: {
					exitgame: {
						label: "OK",
						// tslint:disable-next-line:object-literal-sort-keys
						className: "btn-success btn-lg",
						callback: function() {
                            location.reload();
						},
					},
                },
				message: message,
				title: title,
        });
    }

    private setSocketHandlers(): void {
        this.socket.on("connect", () => {
            log.debug(this.socket.id + "**Player is connected*****");
        });

        this.socket.on("emitRollDice", (die: EmitDie) => {
            if (emit.getEmit() === false && emit.getEnableSocket() === true) {
                // log.debug( " Emit receieved " + JSON.stringify(die));
                this.emitDice.push(die);
                if (this.emitDice.length > 1) {
                    this.dice.rollEmitDice(this.emitDice[0], this.emitDice[1]);
                    this.emitDice = [];
                }
            } else {
                // log.debug(" I cannot recieve dice rolled");
            }
        });

        this.socket.on("emitSelectActivePiece", (emitPiece: EmitPiece) => {
            if (emit.getEmit() === false && emit.getEnableSocket() === true) {
                this.scheduler.getCurrentPlayer().emitSelectCurrentPiece(emitPiece.uniqueId);
            }
            // log.debug("Select piece: " + emitPiece.uniqueId);
        });

        this.socket.on("emitPieceMovement", (movement: Move) => {
            if (emit.getEmit() === false && emit.getEnableSocket() === true) {
                let piece = this.scheduler.getPieceByUniqueId(movement.pieceId);
                if (piece) {
                    let diceUniqueIds = movement.diceId.split("#");
                    // log.debug("Playing dice values: " + diceUniqueIds.join());
                    this.generatePieceMovement(diceUniqueIds, piece);
                } else {
                    log.debug("Error finding piece: " + movement.pieceId);
                }
            }
            // log.debug("Play movement on : " + movement.pieceId);
        });

        this.socket.on("emitAIPieceMovement", (movement: Move) => {
            if (emit.getEmit() === false && emit.getEnableSocket() === true) {
                let piece = this.scheduler.getPieceByUniqueId(movement.pieceId);
                if (piece) {
                    // log.debug("Playing dice values: " + movement.pieceId);
                    this.generateAIPieceMovement(piece, movement);
                } else {
                    log.debug("Error finding piece: " + movement.pieceId);
                }
            }
            // log.debug("Play movement on : " + movement.pieceId);
        });

        this.socket.on("message", (message: string, title: string) => {
            this.displayMessage(message, title);
        });


        this.socket.on("emitChangePlayer", (currentPlayerIds: any) => {
            if (emit.getEmit() === false) {
                this.dice.consumeWithoutEmission();
            }
        });

        this.socket.on("disconnectedPlayerId", (disconnectedPlayerId: string) => {
            log.debug("EmitChangePlayerId " + disconnectedPlayerId);
            let playerName = this.scheduler.getPlayerName(disconnectedPlayerId);
            Display.show(`PlayerName ${playerName} + " has disconnected...`);
        });

        this.socket.on("connectedPlayerId", (disconnectedPlayerId: string) => {
            log.debug("EmitChangePlayerId " + disconnectedPlayerId);
            let playerName = this.scheduler.getPlayerName(disconnectedPlayerId);
            Display.show(`PlayerName ${playerName} + " has disconnected...`);
        });

        this.socket.on("restartGame", (ludogame: LudoGame) => {
            if (emit.getEnableSocket()) {
                log.debug("Updating on restart...");
                if (ludogame.gameId) {
                    emit.checkPlayerId(ludogame.ludoPlayers[0].playerId);
                    this.scheduler.resetScheduler();
                    this.dice.consumeWithoutEmission();
                    this.players.sort((a: Player, b: Player) => {
                        if (a.sequenceNumber < b.sequenceNumber) {
                            return -1;
                        }
                        if (a.sequenceNumber > b.sequenceNumber) {
                            return 1;
                        }
                        return 0;
                    });
                    this.rule.clearBoards();
                    for (let player of this.players) {
                        player.updateOnRestartLudoPieces(ludogame);
                        this.rule.updateOnRestartBoards(player.pieces);
                        this.scheduler.enqueue(player);
                    }
                }
                this.rule.checkBoardConsistencies();
            }
        });

    }
}
