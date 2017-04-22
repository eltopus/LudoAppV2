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

const log = factory.getLogger("model.RuleEnforcer");

export class RuleEnforcer {
    public rule: Rules;
    public scheduler: Scheduler;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private currentPossibleMovements: Move[];
    private dice: Dice;

    constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeboard: ActiveBoard,
    homeboard: HomeBoard, onWayOutBoard: OnWayOutBoard, currentPossibleMovements?: Move[]) {
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
                let player: Player = this.scheduler.getCurrentPlayer();
                this.currentPossibleMovements = this.rule.generateAllPossibleMoves(player);
                this.analyzeAllPossibleMove(player);
            }
        }
    }

    public generatePieceMovement(dieIds: string[], piece: Piece): Move {
        let pieceMovement = this.rule.generatePieceMovement(dieIds, piece);
        let canPlay = false;
        for (let movement of this.currentPossibleMovements) {
            if (movement.compare(pieceMovement)) {
                canPlay = true;
                movement = this.filterMovement(movement, piece);
                let diceValue = this.addDiceValues(this.dice.getDieValueByUniqueId(movement.diceId));
                piece.movePiece(diceValue);
                log.debug("Dice values: " + diceValue);
                break;
            }
        }
        if (!canPlay) {
            log.debug("Move not found!!!: " + this.rule.decodeMove(pieceMovement));
        }
        return pieceMovement;
    }

    public analyzeAllPossibleMove(player: Player): void {
        if (this.currentPossibleMovements.length === 0) {
            log.debug("Player Before...." + player.name);
            let p = this.scheduler.getNextPlayer();
            log.debug("Player After...." + p.name);
        }else {
            this.readAllMoves();
        }
    }

    public readAllMoves(): void {
        for (let move of this.currentPossibleMovements){
            log.debug( this.rule.decodeMove(move));
        }
        // this.rule.addSpentMovesBackToPool(this.currentPossibleMovements);
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
}
