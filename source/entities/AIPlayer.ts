/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import { Piece } from "../entities/Piece";
import { PieceFactory } from "../entities/PieceFactory";
import { ColorType } from "../enums/ColorType";
import { factory } from "../logging/ConfigLog4j";
import { Board } from "./Board";
import { Dice } from "./Dice";
import { Player } from "./Player";
import { RuleEnforcer } from "../rules/RuleEnforcer";
import { AllPossibleMoves } from "../rules/AllPossibleMoves";
import { Move } from "../rules/Move";
import { AIBrainBox } from "../ai/AIBrainBox";
import { MockPiece } from "../ai/MockPiece";
import { PieceInterface } from "../entities/Piece";
import { AIStrategy } from "../enums/AIStrategy";
import { MoveStatus } from "../enums/MoveStatus";
import { States } from "../enums/States";
import { Perimeters } from "./Perimeters";
import { Perimeter } from "./Perimeters";
import { LudoPiece } from "../game/LudoPiece";
import { Path } from "../entities/Path";
import { MockMovementStatus } from "../movement/MockMovementStatus";


const log = factory.getLogger("model.PlayerAI");
export class AIPlayer extends Player {
    private ruleEnforcer: RuleEnforcer = null;
    private logic: AIBrainBox;
    private strategy: AIStrategy;
    private mockMovements: MockMovementStatus = new MockMovementStatus();
    constructor(game: Phaser.Game, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal, playerName: string,
    socket: any, gameId: string, ludoPiece?: LudoPiece[],
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, playerId, turn, colorTypes, signal, playerName, socket, gameId, ludoPiece, previousDoubleSix);
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
            if (movements.length > 0) {
                let randomIndex = (Math.floor(Math.random() * movements.length + 1)) - 1;
                let bestMovement = movements[randomIndex];
                this.findAllMockMovements(movements);
                if (this.mockMovements.containsPecking()) {
                    log.debug("Choosing pecking movement");
                    log.debug("--------------------------------------------------");
                    bestMovement = this.mockMovements.peckingMovements[0];
                }else {
                    let contextMovement: Move = null;
                    if (bestMovement.isActiveMovement() && this.mockMovements.isLudoing(bestMovement)) {
                        log.debug("Switching ludoing context.....");
                        for (let movement of movements) {
                            if (movement.isActiveMovement() && this.mockMovements.isLudoing(movement) === false) {
                                contextMovement = movement;
                                break;
                            }
                        }
                    }
                    if (contextMovement === null && bestMovement.isActiveMovement() && this.mockMovements.isPassing(bestMovement)) {
                        log.debug("Switching passing context.....");
                        for (let movement of movements) {
                            if (movement.isActiveMovement() && this.mockMovements.isPassing(movement) === false) {
                                contextMovement = movement;
                                break;
                            }
                        }
                    }
                    /*
                    if (bestMovement.isActiveMovement() && this.mockMovements.isCrossing(bestMovement)) {
                        // encourage context
                    }
                    */
                    if (contextMovement !== null) {
                        bestMovement = contextMovement;
                    }
                }
                this.mockMovements.resetAll();
                if (bestMovement.isHomeMovement()) {
                    bestMovement = this.checkHomeMovement(bestMovement);
                }
                // log.debug("movementIndex: " + movementIndex + " PossibleMovements:" + possibleMovesTotal);
                let piece = this.getPieceByUniqueId(bestMovement.pieceId);
                setTimeout(() => {
                    if (piece) {
                        piece.setActivePiece();
                    }
                    this.ruleEnforcer.generateAIPieceMovement(piece, bestMovement);
                }, 1000);
            }else {
                log.debug("AI HANDLE EMPTY MOVEMENT!!!!!!!!!!!!!!!!!! SIGN OF BAD RULE FILTER");
                // this.ruleEnforcer.handleEmptyPossibleMovements();
            }
        }
    }

    /**
     * Find and return all mock movements
     * @param movements
     */
    private findAllMockMovements(movements: Move[]): void {
        for (let movement of movements){
            let piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(movement.pieceId);
            if (typeof piece !== "undefined" && piece !== null) {
                let mockPiece: PieceInterface = new MockPiece(piece);
                let startingIndex = mockPiece.index;
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
                    let initialState = piece.state;
                    let path = this.logic.constructMockpath(mockPiece, diceValue);
                    if (this.ruleEnforcer.mockPieceCollision(mockPiece.uniqueId, path.newIndex)) {
                        this.mockMovements.peckingMovements.push(movement);
                    }if (initialState === States.Active && mockPiece.isOnWayOut()) {
                        this.mockMovements.crossingMovements.push(movement);
                    }if (this.ruleEnforcer.mockPiecePassing(path, startingIndex)) {
                       this.mockMovements.passingMovements.push(movement);
                    }if (this.ruleEnforcer.mockPieceLudoing(path)) {
                        this.mockMovements.ludoingMovements.push(movement);
                    }
                }
            }
        }
    }

    private checkHomeMovement(movement: Move): Move {
        if (this.colorTypes.length > 1) {
            let piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(movement.pieceId);
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
                            // log.debug("Switching Piece to another color");
                            movement.pieceId = anotherPiece.uniqueId;
                            log.debug("Switching home piece with one with fewer or no enemies");
                        }
                    }else {
                        // log.debug("No need to Switching Piece to another color");
                    }
                    this.ruleEnforcer.scheduler.addPerimetersToPool(perimeters, this.playerId);
                }
            }
        }

        return movement;
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

    private scanPerimeterForEnemies(movements: Move[]): Move[] {

        return movements;
    }

    private isDefending(): boolean {
        return this.strategy === AIStrategy.Defending;
    }

    private isDefault(): boolean {
        return this.strategy === AIStrategy.Default;
    }

    private aiRollDice(listener: string, dice: Dice, playerId: string) {
        if (listener === "aiRollDice") {
             setTimeout(() => this.roll(dice), 1000);
        }
    }

}
