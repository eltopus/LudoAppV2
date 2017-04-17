// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Actions} from "../enums/Actions";
import {Rule} from "./Rule";
import {AbstractRules} from "./AbstractRules";
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {HomeRules} from "./HomeRules";
import {ActiveRules} from "./ActiveRules";
import {OnWayOutRules} from "./OnWayOutRules";

const log = factory.getLogger("model.Rules");

export class Rules {
protected homeRule: HomeRules;
protected activeRule: ActiveRules;
protected onWayOutRule: OnWayOutRules;
private signal: Phaser.Signal;
private rollCounter = 0;
private schedule: Scheduler;

constructor(signal: Phaser.Signal, schedule: Scheduler, dice: Dice, activeBoard: ActiveBoard, homeBoard: HomeBoard) {
    this.activeRule = new ActiveRules(dice, schedule, activeBoard);
    this.homeRule = new HomeRules(dice, schedule, homeBoard);
    this.onWayOutRule = new OnWayOutRules(dice, schedule, homeBoard);
    this.schedule = schedule;
    this.signal = signal;
    this.signal.add(this.endOfDiceRoll, this, 0, "endOfDieRoll");
}



public generateRules(player: Player): Rule[] {
    let activeRules: Rule[] = this.activeRule.generateRules(player);
    let homeRules: Rule[] = this.homeRule.generateRules(player);
    // log.debug("Total # of rules: " + homeRules.length);
    for (let rule of homeRules){
        log.debug(this.homeRule.decodeRule(rule));
    }
    for (let rule of activeRules){
        log.debug(this.activeRule.decodeRule(rule));
    }
    this.homeRule.addSpentRulesBackToPool(homeRules);
    this.activeRule.addSpentRulesBackToPool(activeRules);
    // this.activeRule.showFinalResults();
    // this.homeRule.showFinalResults();
    return null;
}


public generateOnWayOutRules(piece: Piece): Rule[] {
    return null;
}


public endOfDiceRoll(listener: string): void {
        if (listener === "endOfDieRoll") {
            ++this.rollCounter;
            if (this.rollCounter === 2) {
                this.rollCounter = 0;
                let player: Player = this.schedule.getCurrentPlayer();
                this.generateRules(player);
            }
        }
    }


}
