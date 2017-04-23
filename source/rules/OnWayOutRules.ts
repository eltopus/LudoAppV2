/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import {Scheduler} from "../rules/Scheduler";
import {Dice} from "../entities/Dice";
import {Board} from "../entities/Board";
import {Actions} from "../enums/Actions";
import {Move} from "./Move";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";
import {Player} from "../entities/Player";
import {States} from "../enums/States";
import {AbstractRules} from "./AbstractRules";
const log = factory.getLogger("model.OnWayOutRules");


export class OnWayOutRules extends AbstractRules {
    public state: States = States.onWayOut;
    constructor(dice: Dice, schedule: Scheduler, board: Board) {
        super(dice, schedule, board);
    }

    public generateMoves(player: Player): Move[] {
        let moves: Move[] = [];
        let uniqueId1 = this.dice.dieOne.uniqueId;
        let uniqueId2 = this.dice.dieTwo.uniqueId;
        if (uniqueId1 === null || uniqueId2 === null) {
            log.debug("No matching uniqueIds for the values supplied!!!");
            return;
        }
        let onWayOutPieces: Piece[] = player.getOnWayOutPieces(this.board);
        for (let piece of onWayOutPieces) {
            if (!this.dice.dieOne.isConsumed() && (this.dice.dieOne.getValue() + piece.index) <= 5) {
                let move = this.getNewRule();
                move.action = Actions.PLAY;
                move.diceId = uniqueId1;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
            if (!this.dice.dieTwo.isConsumed() && (this.dice.dieTwo.getValue() + piece.index) <= 5) {
                let move = this.getNewRule();
                move.action = Actions.PLAY;
                move.diceId = uniqueId2;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
            if (!this.dice.dieOne.isConsumed() && !this.dice.dieTwo.isConsumed() &&
            (this.dice.dieOne.getValue() + this.dice.dieTwo.getValue() + piece.index) <= 5) {
                let move = this.getNewRule();
                move.action = Actions.PLAY;
                move.diceId = uniqueId1 + "#" + uniqueId2;
                move.pieceId = piece.uniqueId;
                move.state = this.state;
                moves.push(move);
            }
        }

        return moves;
    }
    public generateOnWayOutPieceMovement(dieUniqueIds: string[], piece: Piece): Move {
        return this.generatePieceMovement(dieUniqueIds, piece, this.state);
    }
}
