/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Dice} from "./Dice";
import {Player} from "./Player";
import {RuleEnforcer} from "../rules/RuleEnforcer";
import {AllPossibleMoves} from "../rules/AllPossibleMoves";
import {Move} from "../rules/Move";

const log = factory.getLogger("model.PlayerAI");
export class AIPlayer extends Player {
    private ruleEnforcer: RuleEnforcer = null;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal,
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, name, playerId, turn, colorTypes, signal, previousDoubleSix);
        this.isAI = true;
        this.ruleEnforcer = ruleEnforcer;
        this.signal.add(this.aiRollDice, this, 0, "aiRollDice");
        this.signal.add(this.playAIPlayerMovement, this, 0, "aiPlayerMovement");
    }

    public playAIPlayerMovement(listener: string, playerId: string, currentPossibleMovements: AllPossibleMoves): void {
        if (listener === "aiPlayerMovement" && this.playerId === playerId) {
            let movements = currentPossibleMovements.getConcatenatedPossibleMoves();
            let possibleMovesTotal = movements.length;
            if (possibleMovesTotal > 0) {
                let movementIndex = 0;
                if (possibleMovesTotal > 0) {
                    movementIndex = (Math.floor(Math.random() * possibleMovesTotal + 1)) - 1;
                }
                // log.debug("movementIndex: " + movementIndex + " PossibleMovements:" + possibleMovesTotal);
                let pieceMovement = movements[movementIndex];
                let piece = this.getPieceByUniqueId(pieceMovement.pieceId);
                setTimeout(() => {
                    this.ruleEnforcer.generateAIPieceMovement(piece, pieceMovement);
                }, 1000);
            }
        }
    }
    private aiRollDice(listener: string, dice: Dice, playerId: string) {
        if (listener === "aiRollDice" && this.playerId === playerId) {
             setTimeout(() => {
                this.roll(dice, 6, 5);
            }, 1000);
        }
    }

}
