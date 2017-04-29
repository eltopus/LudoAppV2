/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Actions} from "../enums/Actions";
import {Board} from "../entities/Board";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {AbstractRules} from "./AbstractRules";
import {States} from "../enums/States";
const log = factory.getLogger("model.HomeRules");


export class ExitedRules extends AbstractRules {
    protected state: States = States.AtHome;
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }
}
