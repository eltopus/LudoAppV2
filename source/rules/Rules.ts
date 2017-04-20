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


const log = factory.getLogger("model.Rules");

export class Rules {
protected homeMove: HomeRules;
protected activeMove: ActiveRules;
protected onWayOutMove: OnWayOutRules;
private signal: Phaser.Signal;
private rollCounter = 0;
private schedule: Scheduler;
private dice: Dice;

constructor(signal: Phaser.Signal, schedule: Scheduler, dice: Dice, activeBoard: ActiveBoard, 
homeBoard: HomeBoard, onWayOutBoard: OnWayOutBoard) {
    this.activeMove = new ActiveRules(dice, schedule, activeBoard);
    this.homeMove = new HomeRules(dice, schedule, homeBoard);
    this.onWayOutMove = new OnWayOutRules(dice, schedule, onWayOutBoard);
    this.schedule = schedule;
    this.signal = signal;
    this.dice = dice;
    this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
}



public generateAllPossibleMoves(player: Player): Move[] {
    let activeMoves: Move[] = this.activeMove.generateMoves(player);
    let homeMoves: Move[] = this.homeMove.generateMoves(player);
    let onWayOutMoves: Move[] = this.onWayOutMove.generateMoves(player);
   
    let finalMoves: Move[] = homeMoves.concat(activeMoves).concat(onWayOutMoves);
    return finalMoves;
}

public addSpentMovesBackToPool(moves: Move[]): void{

    if (moves.length > 0){
        if (moves[0].state === States.Active){
            this.activeMove.addSpentRulesBackToPool(moves);
        }else if (moves[0].state === States.AtHome){
            this.homeMove.addSpentRulesBackToPool(moves);
        }else if (moves[0].state === States.onWayOut){
            this.onWayOutMove.addSpentRulesBackToPool(moves);
        }
    }

}


public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                let player: Player = this.schedule.getCurrentPlayer();
                let moves: Move[] = this.generateAllPossibleMoves(player);
                this.signal.dispatch("moves", moves);
            }
        }
    }

    public decodeMoves(move: Move): string {

        switch(move.state){
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

     public decodeActiveMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "ACTIVE PLAY " + this.dice.getDieValueByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "ACTIVE SKIP";
        }else {
            return "DO NOTHING";
        }
    }

    public decodeHomeMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "HOME PLAY " + this.dice.getDieValueByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "HOME SKIP";
        }else {
            return "DO NOTHING";
        }
    }

    public decodeOnWayOutMove(move: Move): string {
        if (move.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (move.action === Actions.EXIT) {
            return "EXIT " + move.pieceId;
        }else if (move.action === Actions.PLAY) {
            return "ONWAYOUT PLAY " + this.dice.getDieValueByUniqueId(move.diceId).join() + " ON " + move.pieceId;
        }else if (move.action === Actions.ROLL) {
            return "ROLL";
        }else if (move.action === Actions.SKIP) {
            return "ONWAYOUT SKIP";
        }else {
            return "DO NOTHING";
        }
    }


}
