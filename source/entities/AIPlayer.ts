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
import {AIStrategy} from "../enums/AIStrategy";
import {Perimeters} from "./Perimeters";
import {Perimeter} from "./Perimeters";
import {LudoPiece} from "../game/LudoPiece";


const log = factory.getLogger("model.PlayerAI");
export class AIPlayer extends Player {
    private ruleEnforcer: RuleEnforcer = null;
    private logic: AIBrainBox;
    private strategy: AIStrategy;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal,
    socket: any, gameId: string, ludoPiece?: LudoPiece[],
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, name, playerId, turn, colorTypes, signal, socket, gameId, ludoPiece, previousDoubleSix);
        this.isAI = true;
        this.ruleEnforcer = ruleEnforcer;
        this.signal.add(this.aiRollDice, this, 0, "aiRollDice");
        this.signal.add(this.playAIPlayerMovement, this, 0, "aiPlayerMovement");
        this.logic = new AIBrainBox(this.ruleEnforcer, this.signal);
        this.strategy = AIStrategy.Defending;
    }

    public playAIPlayerMovement(listener: string, playerId: string, currentPossibleMovements: AllPossibleMoves): void {
        if (listener === "aiPlayerMovement" && this.playerId === playerId) {
            let movements = currentPossibleMovements.getConcatenatedPossibleMoves();
            let possibleMovesTotal = movements.length;
            if (possibleMovesTotal > 0) {
                let bestMove = this.bestMovement(movements);
                // log.debug("movementIndex: " + movementIndex + " PossibleMovements:" + possibleMovesTotal);
                let piece = this.getPieceByUniqueId(bestMove.pieceId);
                setTimeout(() => {
                    if (piece) {
                        piece.setActivePiece();
                    }
                    this.ruleEnforcer.generateAIPieceMovement(piece, bestMove);
                }, 1000);
            }else {
                log.debug("AI HANDLE EMPTY MOVEMENT!!!!!!!!!!!!!!!!!! SIGN OF BAD RULE FILTER");
                // this.ruleEnforcer.handleEmptyPossibleMovements();
            }
        }
    }
    private aiRollDice(listener: string, dice: Dice, playerId: string) {
        if (listener === "aiRollDice") {
             setTimeout(() => this.roll(dice), 1000);
        }
    }

    private bestMovement(movements: Move[]): Move {
        let bestMove: Move = null;
        for (let movement of movements){
            let piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(movement.pieceId);
            bestMove = this.findPeckMove(movement, piece, bestMove);
            if (bestMove !== null) {
                log.debug("USING PECK MOVE!!!!!!!!!!!!!!!!");
                break;
            }
        }
        if (bestMove === null) {
            let movementIndex = 0;
            movementIndex = (Math.floor(Math.random() * movements.length + 1)) - 1;
            bestMove = movements[movementIndex];
            if (bestMove.isHomeMovement()) {
                // Player has more than one color
                if (this.colorTypes.length > 1) {
                    let piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(bestMove.pieceId);
                    if (piece !== null) {
                        let perimeters = this.ruleEnforcer.scheduler.getHomeEnemyPerimeters();
                        for (let perimeter of perimeters){
                            // log.debug("After PerimeterIndex: " + perimeter.pieceIndex + " PerimeterColor: " + perimeter.pieceColor + " id " + this.playerId);
                        }
                        if (perimeters.length > 0) {
                            let colorWithFewerEnemies = this.getColorWithFewerEnemies(perimeters);
                            if (colorWithFewerEnemies !== null && colorWithFewerEnemies !== piece.color) {
                                let anotherPiece = this.sampleHomePieceByColor(colorWithFewerEnemies);
                                if (anotherPiece !== null) {
                                    log.debug("Switching Piece to another color");
                                    bestMove.pieceId = anotherPiece.uniqueId;
                                }
                            }else {
                                log.debug("No need to Switching Piece to another color");
                            }
                            this.ruleEnforcer.scheduler.addPerimetersToPool(perimeters, this.playerId);
                        }
                    }
                }
            }else if (bestMove.isActiveMovement()) {
                // TODO
            }
        }

        return bestMove;
    }

    private getColorWithFewerEnemies(perimeters: Perimeter[]): ColorType {
        let colorWithFewerEnemies: ColorType = null;
        let enemiesBehindLine = 0;
        for (let color of this.colorTypes) {
            let piece = this.samplePieceByColor(color);
            if (piece !== null) {
                let enemiesWithinPerimeter = piece.numberOfEnemiesWithinPerimeter(perimeters);
                if (enemiesWithinPerimeter <= enemiesBehindLine) {
                    enemiesBehindLine = enemiesWithinPerimeter;
                    colorWithFewerEnemies = color;
                    // log.debug("After PerimeterIndex: " + enemiesWithinPerimeter);
                }
            }
        }
        return colorWithFewerEnemies;
    }

    private samplePieceByColor(color: ColorType): Piece {
        let matchingPiece: Piece = null;
        for (let piece of this.pieces){
            if (piece.color === color) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    }

    private sampleHomePieceByColor(color: ColorType): Piece {
        let matchingPiece: Piece = null;
        for (let piece of this.pieces){
            if (piece.color === color && piece.isAtHome()) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    }

    private findPeckMove(movement: Move, piece: Piece, peckMove: Move): Move {
        if (typeof piece !== "undefined" && piece !== null) {
            let mockPiece: PieceInterface = new MockPiece(piece);
            if (mockPiece.isAtHome()) {
                movement = this.ruleEnforcer.consumeDieMockValueSix(movement);
                mockPiece.index = mockPiece.startIndex;
            }else {
                movement.mockDiceId = movement.diceId;
            }
            let diceValueArr = this.ruleEnforcer.dice.getDieValueArrayByUniqueId(movement.mockDiceId);
            if (diceValueArr.length > 0) {
                let diceValue = this.ruleEnforcer.addDiceValues(diceValueArr);
                if (movement.mockConsumeDieValueSix) {
                    diceValue = 0;
                    movement.mockConsumeDieValueSix = false;
                    movement.mockDiceId = "";
                }
                let path = this.logic.constructMockpath(mockPiece, diceValue);
                if (this.ruleEnforcer.mockPieceCollision(mockPiece.uniqueId, path.newIndex)) {
                    log.debug("END >>>>>>>>>>>>>>>>MOVE CAN PECK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + path.newIndex);
                    peckMove = movement;
                }
            }
        }else {
            log.debug("PIECE IS NULL.....................");
        }
        return peckMove;
    }

    private scanPerimeterForEnemies(movements: Move[]): Move[] {

        return movements;
    }

    private isDefending(): boolean {
        return this.strategy === AIStrategy.Defending;
    }

    private isDefault(): boolean {
        return this.strategy === AIStrategy.Default;
    }

}
