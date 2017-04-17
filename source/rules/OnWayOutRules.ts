/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Board} from "../entities/Board";
import {Actions} from "../enums/Actions";
import {Rule} from "./Rule";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {AbstractRules} from "./AbstractRules";
const log = factory.getLogger("model.OnWayOutRules");


export class OnWayOutRules extends AbstractRules {
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateRules(player: Player): Rule[] {
        let rules: Rule[] = [];
        return rules;
    }

}
