// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Rules} from "../rules/Rules";
import {Player} from "../entities/Player";
import {Piece} from "../entities/Piece";
import {Move} from "./Move";
import {Board} from "../entities/Board";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {factory} from "../logging/ConfigLog4j";
import {AllPossibleMoves} from "./AllPossibleMoves";

const log = factory.getLogger("model.RuleEnforcer");

export class RuleEnforcer {
    public rule: Rules;
    public scheduler: Scheduler;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private currentPossibleMovements: AllPossibleMoves;
    private dice: Dice;

    constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeboard: ActiveBoard,
    homeboard: HomeBoard, onWayOutBoard: OnWayOutBoard, currentPossibleMovements?: AllPossibleMoves) {
        this.signal = signal;
        this.scheduler = scheduler;
        this.dice = dice;
        this.currentPossibleMovements = currentPossibleMovements;
        this.rule = new Rules(this.signal, scheduler, dice, activeboard, homeboard, onWayOutBoard);
        this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
    }

    public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                this.generateAllPossibleMoves();
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
        let movements = this.currentPossibleMovements.getPieceMoves(piece.state);
        let currentPlayer = this.scheduler.getCurrentPlayer();
        for (let movement of movements) {
            if (movement.compare(pieceMovement)) {
                canPlay = true;
                movement = this.filterMovement(movement, piece);
                let diceValue = this.addDiceValues(this.dice.getDieValueArrayByUniqueId(movement.diceId));
                this.dice.consumeDieValueById(movement.diceId);
                piece.movePiece(diceValue);
                // Check collision must always come after movePiece is called
                if (piece.isActive()) {
                    let id = this.checkCollision(piece.uniqueId, piece.index);
                    if (!currentPlayer.pieceBelongsToMe(id)) {
                        // log.debug(id + " does NOT belong to me");
                        let outGoingPiece = this.scheduler.getPieceByUniqueId(id);
                        if (typeof outGoingPiece !== null && typeof outGoingPiece !== "undefined") {
                            piece.collidingPiece = outGoingPiece;
                        }
                    }
                }
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.activeMoves);
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.homeMoves);
                this.rule.addSpentMovesBackToPool(this.currentPossibleMovements.onWayOutMoves);
                this.currentPossibleMovements.resetMoves();
                this.generateAllPossibleMoves();
                break;
            }
        }
        if (!canPlay) {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
        }
        return pieceMovement;
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
    }

    public addDiceValues(diceValues: number[]): number {
        let value = 0;
        for (let dieValue of diceValues){
            value += dieValue;
        }
        return value;
    }

    private filterMovement(movement: Move, piece: Piece): Move {
        if (piece.isAtHome()) {
            this.dice.consumeDieValueSix(movement.diceId);
            piece.index = piece.startIndex;
        }
        return movement;
    }

    private generateAllPossibleMoves(): void {
        let player: Player = this.scheduler.getCurrentPlayer();
        this.currentPossibleMovements = this.rule.generateAllPossibleMoves(player);
        this.analyzeAllPossibleMove(player);
    }

    private analyzeAllPossibleMove(player: Player): void {
        if (this.currentPossibleMovements.isEmpty()) {
            let p = this.scheduler.getNextPlayer();
        }else if (player.hasExactlyOneActivePiece()) {
            this.currentPossibleMovements = this.checkCornerCaseRules(this.currentPossibleMovements, player);
        }
        this.readAllMoves();
    }

    private checkCornerCaseRules(currentPossibleMovements: AllPossibleMoves, player: Player): AllPossibleMoves {
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
            log.debug("Size: " + onWayOutPieceMovements.length);
            /** This checks corner case for when a player has one onwayout piece and one active piece
                Rule must ensure that player is not allowed to play die value on active piece leaving
                the other value that onwayout piece cannot play
            */
            if (onWayOutPieceMovements.length === 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                for (let x = 0; x < currentPossibleMovements.activeMoves.length; x++) {
                    if (onWayOutPieceMovements[0].diceId === currentPossibleMovements.activeMoves[x].diceId) {
                        let illegalMove = currentPossibleMovements.activeMoves[x];
                        log.debug("Successfully Removing illegal move: " + this.rule.decodeMove(illegalMove));
                        currentPossibleMovements.activeMoves.splice(x, 1);
                        break;
                    }
                }
            }else if (onWayOutPieceMovements.length > 1 && (!this.dice.rolledAtLeastOneSix() && player.hasHomePieces())) {
                for (let x = 0; x < currentPossibleMovements.activeMoves.length; x++) {
                    for (let onWayMovement of onWayOutPieceMovements){
                        if (onWayMovement.diceId === currentPossibleMovements.activeMoves[x].diceId) {
                            if (this.onWayOutCanUseBothDice(onWayMovement.diceId, onWayOutPieceMovements)) {
                                let illegalMove = currentPossibleMovements.activeMoves[x];
                                log.debug("Successfully Removed illegal move: " + this.rule.decodeMove(illegalMove));
                                currentPossibleMovements.activeMoves.splice(x, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return currentPossibleMovements;
    }

    private onWayOutCanUseBothDice(dieId: string, movements: Move[]): boolean {
        let isLegalMove = true;
        let dieUniqueId = this.dice.dieOne.uniqueId;
        if (dieId !== this.dice.dieOne.uniqueId) {
            dieId = this.dice.dieOne.uniqueId;
        }else if (dieId !== this.dice.dieTwo.uniqueId) {
            dieId = this.dice.dieTwo.uniqueId;
        }
        for (let movement of movements){
            if (movement.diceId === dieId) {
                isLegalMove = false;
                break;
            }
        }
        return (isLegalMove);
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
}
