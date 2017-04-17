/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Actions} from "../enums/Actions";
import {Board} from "../entities/Board";
import {Rule} from "./Rule";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {AbstractRules} from "./AbstractRules";
const log = factory.getLogger("model.HomeRules");


export class HomeRules extends AbstractRules {
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateRules(player: Player): Rule[] {
        let rules: Rule[] = [];
        if (this.rolledDoubleSix()) {
            let uniqueId1 = this.dice.dieOne.uniqueId;
            let uniqueId2 = this.dice.dieTwo.uniqueId;
            if (uniqueId1 === null || uniqueId2 === null) {
                log.debug("No matching uniqueIds for the values supplied!!!");
                return;
            }
            let homePieces: Piece[] = player.getHomePieces(this.board);
            for (let piece of homePieces) {
                let rule = this.getNewRule();
                rule.action = Actions.PLAY;
                rule.diceId = uniqueId1;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                rule = this.getNewRule();
                rule.action = Actions.PLAY;
                rule.diceId = uniqueId2;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                // log.debug("HomePiecesId1: " + piece.uniqueId + " PlayerID: " + player.name);
            }
        }else if (this.rolledAtLeastOneSix()) {
            let uniqueId = this.dice.getDieByValue(6);
            if (uniqueId === null) {
                log.debug("No matching uniqueId for the value supplied!!!");
                return;
            }
            let homePieces: Piece[] = player.getHomePieces(this.board);
            for (let piece of homePieces) {
                let rule = this.getNewRule();
                rule.action = Actions.PLAY;
                rule.playBothDice = true;
                rule.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                rule.pieceId = piece.uniqueId;
                rules.push(rule);
                // log.debug("HomePiecesId: " + piece.uniqueId + " PlayerID: " + player.name);
            }
        }else {
            let rule = this.getNewRule();
            rule.action = Actions.SKIP;
            rules.push(rule);
        }
        return rules;
    }

    public decodeRule(rule: Rule): string {
        if (rule.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (rule.action === Actions.EXIT) {
            return "EXIT " + rule.pieceId;
        }else if (rule.action === Actions.PLAY) {
            return "HOME PLAY " + this.dice.getDieValueByUniqueId(rule.diceId).join() + " ON " + rule.pieceId;
        }else if (rule.action === Actions.ROLL) {
            return "ROLL";
        }else if (rule.action === Actions.SKIP) {
            return "SKIP";
        }else {
            return "DO NOTHING";
        }
    }
}
