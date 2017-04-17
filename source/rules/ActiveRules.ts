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
const log = factory.getLogger("model.ActiveRules");


export class ActiveRules extends AbstractRules {
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateRules(player: Player): Rule[] {
        let rules: Rule[] = [];
        let activePieces: Piece[] = player.getActivePieces(this.board);
        for (let piece of activePieces) {
             // log.debug("Active PiecesId: " + piece.uniqueId + " PlayerID: " + player.name);
            let dieUniqueIds = this.willCrossEntryPoint(piece);
            if (dieUniqueIds.length > 0) {
                // Established that both dice values cannot be played on piece
                // ids of die values that could take piece on the way out
                let ids = this.willCrossExitPoint(piece);
                if (ids.length > 0) {

                    for (let id of ids){
                        let rule = this.getNewRule();
                        rule.action = Actions.PLAY;
                        rule.diceId = id;
                        rule.pieceId = piece.uniqueId;
                        rules.push(rule);
                        log.debug("Exit crossing alert!!! Dice id " + id + " will take piece on way out piece " + piece.uniqueId);
                    }
                }else {
                    // check if code makes sense
                    for (let uniqueId of dieUniqueIds){
                        let rule = this.getNewRule();
                        rule.action = Actions.PLAY;
                        rule.diceId = uniqueId;
                        rule.pieceId = piece.uniqueId;
                        rules.push(rule);
                        log.debug("Dice id makes sense " + uniqueId + " will take piece on way out piece " + piece.uniqueId);
                    }
                }

            }else {
                log.debug("Normal play rule generated ");
                    let rule = this.getNewRule();
                    rule.action = Actions.PLAY;
                    rule.diceId = this.dice.dieOne.uniqueId;
                    rule.pieceId = piece.uniqueId;
                    rules.push(rule);
                    rule = this.getNewRule();
                    rule.action = Actions.PLAY;
                    rule.diceId = this.dice.dieTwo.uniqueId;
                    rule.pieceId = piece.uniqueId;
                    rules.push(rule);
                    rule = this.getNewRule();
                    rule.action = Actions.PLAY;
                    // # indicates that two dice values are needed
                    rule.diceId = this.dice.dieOne.uniqueId + "#" + this.dice.dieTwo.uniqueId;
                    rule.pieceId = piece.uniqueId;
                    rules.push(rule);
            }
        }
        return rules;
    }

    public decodeRule(rule: Rule): string {
        if (rule.action === Actions.DO_NOTHING) {
            return "DO NOTHING";
        }else if (rule.action === Actions.EXIT) {
            return "EXIT " + rule.pieceId;
        }else if (rule.action === Actions.PLAY) {
            return "ACTIVE PLAY " + this.dice.getDieValueByUniqueId(rule.diceId).join() + " ON " + rule.pieceId;
        }else if (rule.action === Actions.ROLL) {
            return "ROLL";
        }else if (rule.action === Actions.SKIP) {
            return "ACTIVE SKIP";
        }else {
            return "DO NOTHING";
        }
    }

}
