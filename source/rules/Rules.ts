// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Actions} from "../enums/Actions";
import {Rule} from "./Rule";
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";

const log = factory.getLogger("model.Rules");

export class Rules {

private signal: Phaser.Signal;
private rollCounter = 0;
private schedule: Scheduler;
private dice: Dice;
private activeBoard: ActiveBoard;
private homeBoard: HomeBoard;

constructor(signal: Phaser.Signal, scheduler: Scheduler, dice: Dice, activeBoard: ActiveBoard, homeBoard: HomeBoard) {
    this.signal = signal;
    this.schedule = scheduler;
    this.dice = dice;
    this.activeBoard = activeBoard;
    this.homeBoard = homeBoard;
    this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
}



public generateRules(player: Player): Rule[] {
    let dieOne = this.dice.dieOne.getValue();
    let dieTwo = this.dice.dieTwo.getValue();
    log.debug("DieOne " + dieOne + " dieTwo " + dieTwo);
    this.generateActiveRules(player);
    this.generateHomeRules(player);
    return null;
}

public generateActiveRules(player: Player): Rule[] {
    let activePieces: Piece[] = player.getActivePieces(this.activeBoard);
    for (let p of activePieces) {
        log.debug("Active PiecesId: " + p.uniqueId + " PlayerID: " + player.name);
    }
    return null;
}

public generateHomeRules(player: Player): Rule[] {
    let homePieces: Piece[] = player.getHomePieces(this.homeBoard);
    for (let p of homePieces) {
        log.debug("HomePiecesId: " + p.uniqueId + " PlayerID: " + player.name);
    }
    return null;
}

public generateOnWayOutRules(piece: Piece): Rule[] {
    return null;
}

public decodeRule(rule: Rule): string {
    if (rule.action === Actions.DO_NOTHING) {
        return "DO NOTHING";
    }else if (rule.action === Actions.EXIT) {
         return "EXIT " + rule.pieceId;
    }else if (rule.action === Actions.PLAY) {
        return "PLAY " + rule.diceValue + " ON " + rule.pieceId;
    }else if (rule.action === Actions.ROLL) {
        return "ROLL";
    }else if (rule.action === Actions.SKIP) {
        return "SKIP";
    }else {
        return "DO NOTHING";
    }
}


    public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                let player: Player = this.schedule.getCurrentPlayer();
                // Duplicate! Condition already checked in Die object
                if (this.dice.dieOne.getPlayerId() === player.playerId) {
                    // log.debug("Player Id and dice id matches " + player.name);
                }else {
                    // log.debug("Player Id and dice id DO NOT match");
                }
                this.generateRules(player);
            }
        }
    }


}
