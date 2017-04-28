// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Actions} from "../enums/Actions";
import {Move} from "./Move";
import {AbstractRules} from "./AbstractRules";
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {HomeRules} from "./HomeRules";
import {ActiveRules} from "./ActiveRules";
import {OnWayOutRules} from "./OnWayOutRules";
import {States} from "../enums/States";
import {AllPossibleMoves} from "./AllPossibleMoves";
import {Board} from "../entities/Board";


    const log = factory.getLogger("model.Rules");

    export class Rules {
    private homeMove: HomeRules;
    private activeMove: ActiveRules;
    private onWayOutMove: OnWayOutRules;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private schedule: Scheduler;
    private dice: Dice;
    private allPossibleMoves: AllPossibleMoves;

    constructor(signal: Phaser.Signal, schedule: Scheduler, dice: Dice, activeBoard: ActiveBoard,
    homeBoard: HomeBoard, onWayOutBoard: OnWayOutBoard) {
        this.activeMove = new ActiveRules(dice, schedule, activeBoard);
        this.homeMove = new HomeRules(dice, schedule, homeBoard);
        this.onWayOutMove = new OnWayOutRules(dice, schedule, onWayOutBoard);
        this.schedule = schedule;
        this.signal = signal;
        this.dice = dice;
        this.allPossibleMoves = new AllPossibleMoves();
    }

    public getOnWayOutBoard(): Board {
        return this.onWayOutMove.getBoard();
    }

    public getActiveBoard(): Board {
        return this.activeMove.getBoard();
    }

    public getHomeBoard(): Board {
        return this.homeMove.getBoard();
    }

    public generateAllPossibleMoves(player: Player): AllPossibleMoves {
        this.allPossibleMoves.activeMoves = this.activeMove.generateMoves(player);
        this.allPossibleMoves.homeMoves = this.homeMove.generateMoves(player);
        this.allPossibleMoves.onWayOutMoves = this.onWayOutMove.generateMoves(player);
        return this.allPossibleMoves;
    }

    public generatePieceMovement(dieUniqueIds: string[], piece: Piece): Move {
        switch (piece.state) {
            case States.Active:
                return this.activeMove.generateActivePieceMovement(dieUniqueIds, piece);
            case States.AtHome:
                return this.homeMove.generateHomePieceMovement(dieUniqueIds, piece);
            case States.onWayOut:
                return this.onWayOutMove.generateOnWayOutPieceMovement(dieUniqueIds, piece);
            default:
                return null;
        }
    }

    public addSpentMovesBackToPool(moves: Move[]): void {

        let activeMoves: Move[] = [];
        let homeMoves: Move[] = [];
        let onWayOutMoves: Move[] = [];

        for (let move of moves) {
            if (move.state === States.Active) {
                activeMoves.push(move);
            }else if (move.state === States.AtHome) {
                homeMoves.push(move);
            }else if (move.state === States.onWayOut) {
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
    }

    public getUniqueIdCollision(uniqueId: string, index: number): string {
        return this.activeMove.getUniqueIdCollision(uniqueId, index);
    }

    public decodeMove(move: Move): string {
        switch (move.state) {
            case States.Active:
            return this.decodeActiveMove(move);
            case States.AtHome:
            return this.decodeHomeMove(move);
            case States.onWayOut:
            return this.decodeOnWayOutMove(move);
            default:
            return "Unexpected";

        }
    }

    private decodeActiveMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "ACTIVE PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "ACTIVE SKIP";
        }else {
            return "DO NOTHING";
        }
    }

    private decodeHomeMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "HOME PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "HOME SKIP";
        }else {
            return "DO NOTHING";
        }
    }

    private decodeOnWayOutMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "ONWAYOUT PLAY " + this.dice.getDieValueArrayByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "ONWAYOUT SKIP";
        }else {
            return "DO NOTHING";
        }
    }

}
