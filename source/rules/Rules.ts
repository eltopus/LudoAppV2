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
import {ExitedBoard} from "../entities/ExitedBoard";
import {HomeRules} from "./HomeRules";
import {ActiveRules} from "./ActiveRules";
import {OnWayOutRules} from "./OnWayOutRules";
import {ExitedRules} from "./ExitedRules";
import {States} from "../enums/States";
import {AllPossibleMoves} from "./AllPossibleMoves";
import {Board} from "../entities/Board";


    const log = factory.getLogger("model.Rules");

    export class Rules {
    private homeMove: HomeRules;
    private activeMove: ActiveRules;
    private onWayOutMove: OnWayOutRules;
    private exitedMove: ExitedRules;
    private signal: Phaser.Signal;
    private rollCounter = 0;
    private schedule: Scheduler;
    private dice: Dice;
    private allPossibleMoves: AllPossibleMoves;

    constructor(signal: Phaser.Signal, schedule: Scheduler, dice: Dice, activeBoard: ActiveBoard,
    homeBoard: HomeBoard, onWayOutBoard: OnWayOutBoard, exitedBoard: ExitedBoard) {
        this.activeMove = new ActiveRules(dice, schedule, activeBoard);
        this.homeMove = new HomeRules(dice, schedule, homeBoard);
        this.onWayOutMove = new OnWayOutRules(dice, schedule, onWayOutBoard);
        this.exitedMove = new ExitedRules(dice, schedule, exitedBoard);
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
            // this.activeMove.showFinalResults();
        }
        if (homeMoves.length > 0) {
            this.homeMove.addSpentRulesBackToPool(homeMoves);
            // this.homeMove.showFinalResults();
        }
        if (onWayOutMoves.length > 0) {
            this.onWayOutMove.addSpentRulesBackToPool(moves);
            // this.onWayOutMove.showFinalResults();
        }
    }

    public addSpentMoveBackToPool(move: Move): void {
        if (move.state === States.Active) {
            this.activeMove.addToRulePool(move);
        }else if (move.state === States.AtHome) {
            this.homeMove.addToRulePool(move);
        }else if (move.state === States.onWayOut) {
             this.onWayOutMove.addToRulePool(move);
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

    public checkBoardConsistencies(): void {
        let activePieces = this.activeMove.getBoard().board.size();
        let homePieces = this.homeMove.getBoard().board.size();
        let onWayOutPieces = this.onWayOutMove.getBoard().board.size() ;
        let exitedPieces = this.exitedMove.getBoard().board.size();
        let totalPieces = activePieces + homePieces + onWayOutPieces + exitedPieces;

        let playerActivePieces = 0;
        let playerHomePieces = 0;
        let playerOnwayoutPieces = 0;
        let playerExitPieces = 0;

        for (let player of this.schedule.players) {
            playerActivePieces += player.activePieceCount();
            playerHomePieces += player.homePieceCount();
            playerOnwayoutPieces += player.onwayoutCount();
            playerExitPieces += player.exitPieceCount();
        }

           if (totalPieces !== 16) {
            log.debug("Total Pieces mismatch!!! active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
           }else {
               log.debug("active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
           }

           if (playerActivePieces === activePieces && playerHomePieces === homePieces && playerOnwayoutPieces === onWayOutPieces && playerExitPieces === exitedPieces) {
            log.debug("MATCH: " + this.schedule.players.length);
            log.debug("active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
            log.debug("active: " + playerActivePieces + " home: " + playerHomePieces + " onwayOut: " + playerOnwayoutPieces + " exited: " + playerExitPieces);
           }else {
            log.debug("MISMATCH!!!!!!!!!: " + + this.schedule.players.length);
            log.debug("active: " + activePieces + " home: " + homePieces + " onwayOut: " + onWayOutPieces + " exited: " + exitedPieces);
            log.debug("active: " + playerActivePieces + " home: " + playerHomePieces + " onwayOut: " + playerOnwayoutPieces + " exited: " + playerExitPieces);
           }
    }

    public showRulePools(): void {
        log.debug("<Active> RulePool: " + this.activeMove.rulesPool.length + " ActiveRulePool " +  this.activeMove.activeRulePool.length);
        log.debug("<Home> RulePool: " + this.homeMove.rulesPool.length + " ActiveRoolPool " + this.homeMove.activeRulePool.length);
        log.debug("<OnWayOut> RulePool: " + this.onWayOutMove.rulesPool.length + " ActiveRulePool " + this.onWayOutMove.activeRulePool.length);
        log.debug("----------------------------------------------------------------------");
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
