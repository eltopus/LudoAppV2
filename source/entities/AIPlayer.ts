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
import {AIBrainBox} from "../ai/AIBrainBox";
import {MockPiece} from "../ai/MockPiece";
import {PieceInterface} from "../entities/Piece";

const log = factory.getLogger("model.PlayerAI");
export class AIPlayer extends Player {
    private ruleEnforcer: RuleEnforcer = null;
    private logic: AIBrainBox;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal,
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, name, playerId, turn, colorTypes, signal, previousDoubleSix);
        this.isAI = true;
        this.ruleEnforcer = ruleEnforcer;
        this.signal.add(this.aiRollDice, this, 0, "aiRollDice");
        this.signal.add(this.playAIPlayerMovement, this, 0, "aiPlayerMovement");
        this.logic = new AIBrainBox(this.ruleEnforcer, this.signal);
    }

    public playAIPlayerMovement(listener: string, playerId: string, currentPossibleMovements: AllPossibleMoves): void {
        if (listener === "aiPlayerMovement" && this.playerId === playerId) {
            let movements = currentPossibleMovements.getConcatenatedPossibleMoves();
            let possibleMovesTotal = movements.length;
            if (possibleMovesTotal > 0) {
                let peckMove = this.bestMove(movements);
                if (peckMove === null) {
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
                }else {
                    log.debug("USING PECK MOVE!!!!!!!!!!!!!!!!");
                    // log.debug("movementIndex: " + movementIndex + " PossibleMovements:" + possibleMovesTotal);
                    let piece = this.getPieceByUniqueId(peckMove.pieceId);
                    setTimeout(() => {
                        this.ruleEnforcer.generateAIPieceMovement(piece, peckMove);
                    }, 1000);
                }
            }else {
                log.debug("AI HANDLE EMPTY MOVEMENT!!!!!!!!!!!!!!!!!! SIGN OF BAD RULE FILTER");
                // this.ruleEnforcer.handleEmptyPossibleMovements();
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

    private bestMove(movements: Move[]): Move {
        let peckMove: Move = null;
        for (let movement of movements){
            let piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(movement.pieceId);
            if (typeof piece !== "undefined" && piece !== null) {
                let mockPiece: PieceInterface = new MockPiece(piece);
                if (mockPiece.isAtHome()) {
                    movement = this.ruleEnforcer.consumeDieMockValueSix(movement);
                    mockPiece.index = mockPiece.startIndex;
                }
                let diceValueArr = this.ruleEnforcer.dice.getDieValueArrayByUniqueId(movement.diceId);
                if (diceValueArr.length > 0) {
                    let diceValue = this.ruleEnforcer.addDiceValues(diceValueArr);
                    if (movement.mockConsumeDieValueSix) {
                        diceValue = 0;
                        movement.mockConsumeDieValueSix = false;
                    }
                    let path = this.logic.constructMockpath(mockPiece, diceValue);
                    if (this.ruleEnforcer.mockPieceCollision(mockPiece.uniqueId, path.newIndex)) {
                        log.debug("END >>>>>>>>>>>>>>>>MOVE CAN PECK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + path.newIndex);
                        peckMove = movement;
                        // break;
                    }
                }
            }else {
                log.debug("PIECE IS NULL.....................");
            }
        }

        return peckMove;
    }

}
