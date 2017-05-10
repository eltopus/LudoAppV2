// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Rules} from "../rules/Rules";
import {Player} from "../entities/Player";
import {AIPlayer} from "../entities/AIPlayer";
import {Piece} from "../entities/Piece";
import {Move} from "./Move";
import {Board} from "../entities/Board";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {ExitedBoard} from "../entities/ExitedBoard";
import {factory} from "../logging/ConfigLog4j";
import {AllPossibleMoves} from "./AllPossibleMoves";
import {Path} from "../entities/Path";

const log = factory.getLogger("model.RuleEnforcer");

export class RuleEnforcer {
    public rule: Rules;
    public scheduler: Scheduler;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private currentPossibleMovements: AllPossibleMoves;
    private dice: Dice;

    constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeboard: ActiveBoard,
    homeboard: HomeBoard, onWayOutBoard: OnWayOutBoard, exitedBoard: ExitedBoard, currentPossibleMovements?: AllPossibleMoves) {
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard, exitedBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
        this.signal.add(this.onCompletePieceMovement, this, 0, "completeMovement");

    }

    public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.currentPossibleMovements.resetMoves();
                this.generateAllPossibleMoves();
                let currentPlayer = this.scheduler.getCurrentPlayer();
                if (this.dice.rolledDoubleSix()) {
                    currentPlayer.previousDoubleSix = true;
                }
                if (currentPlayer.isAI) {
                    // let AICurrentPlayer: AIPlayer = (AIPlayer) this.scheduler.getCurrentPlayer();
                    this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
                }
                this.rule.checkBoardConsistencies();
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
                        if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                            let backToHomePiece = this.scheduler.getPieceByUniqueId(id);
                            if (backToHomePiece !== null) {
                                backToHomePiece.setAtHome();
                                piece.collidingPiece = backToHomePiece;
                                piece.setExited();
                            }
                        }
                    }
                    piece.movePiece(path);
                    break;
                }else {
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
        }else {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
        }
        return pieceMovement;
    }


    public generateAIPieceMovement(piece: Piece, aiPieceMovement: Move): Move {
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
                if (id !== "NOTFOUND" && !currentPlayer.pieceBelongsToMe(id)) {
                    let backToHomePiece = this.scheduler.getPieceByUniqueId(id);
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
    }

    public readAllMoves(): void {
        for (let move of this.currentPossibleMovements.activeMoves){
            log.debug( this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.homeMoves){
            log.debug( this.rule.decodeMove(move));
        }
        for (let move of this.currentPossibleMovements.onWayOutMoves){
            log.debug( this.rule.decodeMove(move));
        }
        log.debug("+++++++++++++++++++++++++++++++++++++++++++++++++++++" );
    }

    public addDiceValues(diceValues: number[]): number {
        let value = 0;
        for (let dieValue of diceValues){
            value += dieValue;
        }
        return value;
    }

    private filterConsumeDieValueSixMovement(movement: Move, piece: Piece): Move {
        if (piece.isAtHome()) {
            this.dice.consumeDieValueSix(movement.diceId);
            piece.index = piece.startIndex;
        }
        return movement;
    }

    private generateAllPossibleMoves(): void {
        let currentPlayer: Player = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements.resetMoves();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
        this.analyzeAllPossibleMove(currentPlayer);
    }

    private analyzeAllPossibleMove(currentPlayer: Player): void {
        /**
         * Corner case for when player can only play one active or home or onwayout piece.
         * This does not necessarily mean that the player has a total of one piece.
        */
        if (this.currentPossibleMovements.isEmpty()) {
            setTimeout(() => {
                this.handleEmptyPossibleMovements();
            }, 1000);
        }else {
            if (currentPlayer.allPiecesAreAtHome()) {
                this.currentPossibleMovements = this.filterOnAllPiecesAreAtHome(this.currentPossibleMovements, currentPlayer);
            }else if (currentPlayer.hasExactlyOneActivePiece()) {
                this.currentPossibleMovements = this.filterOnHasExactlyOneActivePiece(this.currentPossibleMovements, currentPlayer);
            }else if (!currentPlayer.hasActivePieces() && currentPlayer.hasHomePieces() &&
             this.dice.rolledAtLeastOneSix() && currentPlayer.hasOnWayOutPieces()) {
                this.currentPossibleMovements = this.filterOnNoActiveButHomeAndOnWayOutPieces(this.currentPossibleMovements, currentPlayer);
            }else if (currentPlayer.hasExactlyOnePieceLeft()) {
                this.currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(this.currentPossibleMovements.activeMoves);
                this.currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(this.currentPossibleMovements.homeMoves);
                this.currentPossibleMovements.onWayOutMoves = this.removeMoveWithSingleDieValues(this.currentPossibleMovements.onWayOutMoves);
            }
        }
        this.readAllMoves();
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
            for (let onWayOutPiece of onWayOutPieces){
                onWayOutPieceMovements = onWayOutPieceMovements.concat(this.getDieMovementsOnPiece(onWayOutPiece.uniqueId,
                 currentPossibleMovements.onWayOutMoves));
            }
            // log.debug("Size: " + onWayOutPieceMovements.length);
            /** This checks corner case for when a player has one onwayout piece and one active piece
                Rule must ensure that player is not allowed to play die value on active piece leaving
                the other value that onwayout piece cannot play
            */
            if (onWayOutPieceMovements.length === 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                for (let x = 0; x < currentPossibleMovements.activeMoves.length; x++) {
                    if (onWayOutPieceMovements[0].diceId === currentPossibleMovements.activeMoves[x].diceId) {
                        let illegalMove = currentPossibleMovements.activeMoves[x];
                        log.debug("1 Successfully Removing illegal move: " + this.rule.decodeMove(illegalMove));
                        currentPossibleMovements.activeMoves.splice(x, 1);
                        break;
                    }
                }
                // Both dice must have legit values for this condition to be necessary
            }else if (onWayOutPieceMovements.length > 1 && this.dice.bothDiceHasLegitValues() &&
            (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                // check if dice ids are distinct
                if (this.diceIdsAreDistinct(onWayOutPieceMovements)) {
                    let distinctId = onWayOutPieceMovements[0].diceId;
                    for (let x = 0; x < currentPossibleMovements.activeMoves.length; x++) {
                        if (distinctId === currentPossibleMovements.activeMoves[x].diceId) {
                            let illegalMove = currentPossibleMovements.activeMoves[x];
                            log.debug("2 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                            currentPossibleMovements.activeMoves.splice(x, 1);
                            break;
                        }
                    }

                }
                // piece must play both dice because no onwayout pieces can play either die value;
            }else if (onWayOutPieceMovements.length === 0 && this.dice.bothDiceHasLegitValues() &&
            (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                for (let x = 0; x < currentPossibleMovements.activeMoves.length; x++) {
                    if (this.dice.dieOne.uniqueId === currentPossibleMovements.activeMoves[x].diceId) {
                        let illegalMove = currentPossibleMovements.activeMoves[x];
                        currentPossibleMovements.activeMoves.splice(x, 1);
                        log.debug("3 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                    }
                    if (this.dice.dieTwo.uniqueId === currentPossibleMovements.activeMoves[x].diceId) {
                        let illegalMove = currentPossibleMovements.activeMoves[x];
                        currentPossibleMovements.activeMoves.splice(x, 1);
                        log.debug("4 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                    }
                }
            }
        }else if (player.hasHomePieces()) {
            if (this.dice.rolledAtLeastOneSix() && !this.dice.rolledDoubleSix()) {
                currentPossibleMovements.activeMoves = this.removeMoveWithDieValueSix(currentPossibleMovements.activeMoves);
            }else {
               currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
            }
        }else {
            currentPossibleMovements.activeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.activeMoves);
        }
        return currentPossibleMovements;
    }

    private filterOnAllPiecesAreAtHome(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
        if (!player.hasActivePieces()) {
            currentPossibleMovements.homeMoves = this.removeMoveWithSingleDieValues(currentPossibleMovements.homeMoves);
        }
        return currentPossibleMovements;
    }

    private filterOnNoActiveButHomeAndOnWayOutPieces(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
        let onWayOutPieces = player.getPlayerOnWayOutPieces();
        let onWayOutPieceMovements: Move[] = [];
        for (let onWayOutPiece of onWayOutPieces){
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
        for (let m of onWayOutMovements){
            if (m.diceId !== movement.diceId) {
                distinctIds = false;
                break;
            }
        }
        return distinctIds;

    }

    private getDieMovementsOnPiece(pieceId: string, movements: Move[]): Move[] {
        let onWayOutPieceMovements: Move[] = [];
        for (let movement of movements){
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
            }else {
                log.debug("5 Successfully Removed illegal move: " + this.rule.decodeMove(movements[x]));
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
                }else {
                    let illegalMove = movements[x];
                    log.debug("6 Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                }
             }
         }
         return legalMoves;
    }

     private onCompletePieceMovement(listener: string, piece: Piece): void {
         let currentPlayer = this.scheduler.getCurrentPlayer();
         if (listener === "completeMovement" && currentPlayer.isAI) {
             this.currentPossibleMovements.resetMoves();
             this.currentPossibleMovements = this.rule.generateAllPossibleMoves(currentPlayer);
            if (!this.currentPossibleMovements.isEmpty()) {
              this.signal.dispatch("aiPlayerMovement", currentPlayer.playerId, this.currentPossibleMovements);
            }
        }
    }

    private handleEmptyPossibleMovements(): void {
        let nextPlayer = this.scheduler.getNextPlayer();
        if (nextPlayer.isAI) {
            this.dice.setDicePlayerId(nextPlayer.playerId);
            this.signal.dispatch("aiRollDice", this.dice, nextPlayer.playerId);
        }
    }
}
