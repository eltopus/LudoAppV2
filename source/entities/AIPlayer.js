"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Player_1 = require("./Player");
var AIBrainBox_1 = require("../ai/AIBrainBox");
var MockPiece_1 = require("../ai/MockPiece");
var AIStrategy_1 = require("../enums/AIStrategy");
var log = ConfigLog4j_1.factory.getLogger("model.PlayerAI");
var AIPlayer = (function (_super) {
    __extends(AIPlayer, _super);
    function AIPlayer(game, name, playerId, turn, colorTypes, signal, socket, gameId, ludoPiece, ruleEnforcer, previousDoubleSix) {
        _super.call(this, game, name, playerId, turn, colorTypes, signal, socket, gameId, ludoPiece, previousDoubleSix);
        this.ruleEnforcer = null;
        this.isAI = true;
        this.ruleEnforcer = ruleEnforcer;
        this.signal.add(this.aiRollDice, this, 0, "aiRollDice");
        this.signal.add(this.playAIPlayerMovement, this, 0, "aiPlayerMovement");
        this.logic = new AIBrainBox_1.AIBrainBox(this.ruleEnforcer, this.signal);
        this.strategy = AIStrategy_1.AIStrategy.Defending;
    }
    AIPlayer.prototype.playAIPlayerMovement = function (listener, playerId, currentPossibleMovements) {
        var _this = this;
        if (listener === "aiPlayerMovement" && this.playerId === playerId) {
            var movements = currentPossibleMovements.getConcatenatedPossibleMoves();
            var possibleMovesTotal = movements.length;
            if (possibleMovesTotal > 0) {
                var bestMove_1 = this.bestMovement(movements);
                // log.debug("movementIndex: " + movementIndex + " PossibleMovements:" + possibleMovesTotal);
                var piece_1 = this.getPieceByUniqueId(bestMove_1.pieceId);
                setTimeout(function () {
                    if (piece_1) {
                        piece_1.setActivePiece();
                    }
                    _this.ruleEnforcer.generateAIPieceMovement(piece_1, bestMove_1);
                }, 1000);
            }
            else {
                log.debug("AI HANDLE EMPTY MOVEMENT!!!!!!!!!!!!!!!!!! SIGN OF BAD RULE FILTER");
            }
        }
    };
    AIPlayer.prototype.aiRollDice = function (listener, dice, playerId) {
        var _this = this;
        if (listener === "aiRollDice") {
            setTimeout(function () { return _this.roll(dice); }, 1000);
        }
    };
    AIPlayer.prototype.bestMovement = function (movements) {
        var bestMove = null;
        for (var _i = 0, movements_1 = movements; _i < movements_1.length; _i++) {
            var movement = movements_1[_i];
            var piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(movement.pieceId);
            bestMove = this.findPeckMove(movement, piece, bestMove);
            if (bestMove !== null) {
                log.debug("USING PECK MOVE!!!!!!!!!!!!!!!!");
                break;
            }
        }
        if (bestMove === null) {
            var movementIndex = 0;
            movementIndex = (Math.floor(Math.random() * movements.length + 1)) - 1;
            bestMove = movements[movementIndex];
            if (bestMove.isHomeMovement()) {
                // Player has more than one color
                if (this.colorTypes.length > 1) {
                    var piece = this.ruleEnforcer.scheduler.getPieceByUniqueId(bestMove.pieceId);
                    if (piece !== null) {
                        var perimeters = this.ruleEnforcer.scheduler.getHomeEnemyPerimeters();
                        for (var _a = 0, perimeters_1 = perimeters; _a < perimeters_1.length; _a++) {
                            var perimeter = perimeters_1[_a];
                        }
                        if (perimeters.length > 0) {
                            var colorWithFewerEnemies = this.getColorWithFewerEnemies(perimeters);
                            if (colorWithFewerEnemies !== null && colorWithFewerEnemies !== piece.color) {
                                var anotherPiece = this.sampleHomePieceByColor(colorWithFewerEnemies);
                                if (anotherPiece !== null) {
                                    log.debug("Switching Piece to another color");
                                    bestMove.pieceId = anotherPiece.uniqueId;
                                }
                            }
                            else {
                                log.debug("No need to Switching Piece to another color");
                            }
                            this.ruleEnforcer.scheduler.addPerimetersToPool(perimeters, this.playerId);
                        }
                    }
                }
            }
            else if (bestMove.isActiveMovement()) {
            }
        }
        return bestMove;
    };
    AIPlayer.prototype.getColorWithFewerEnemies = function (perimeters) {
        var colorWithFewerEnemies = null;
        var enemiesBehindLine = 0;
        for (var _i = 0, _a = this.colorTypes; _i < _a.length; _i++) {
            var color = _a[_i];
            var piece = this.samplePieceByColor(color);
            if (piece !== null) {
                var enemiesWithinPerimeter = piece.numberOfEnemiesWithinPerimeter(perimeters);
                if (enemiesWithinPerimeter <= enemiesBehindLine) {
                    enemiesBehindLine = enemiesWithinPerimeter;
                    colorWithFewerEnemies = color;
                }
            }
        }
        return colorWithFewerEnemies;
    };
    AIPlayer.prototype.samplePieceByColor = function (color) {
        var matchingPiece = null;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.color === color) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    };
    AIPlayer.prototype.sampleHomePieceByColor = function (color) {
        var matchingPiece = null;
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.color === color && piece.isAtHome()) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    };
    AIPlayer.prototype.findPeckMove = function (movement, piece, peckMove) {
        if (typeof piece !== "undefined" && piece !== null) {
            var mockPiece = new MockPiece_1.MockPiece(piece);
            if (mockPiece.isAtHome()) {
                movement = this.ruleEnforcer.consumeDieMockValueSix(movement);
                mockPiece.index = mockPiece.startIndex;
            }
            else {
                movement.mockDiceId = movement.diceId;
            }
            var diceValueArr = this.ruleEnforcer.dice.getDieValueArrayByUniqueId(movement.mockDiceId);
            if (diceValueArr.length > 0) {
                var diceValue = this.ruleEnforcer.addDiceValues(diceValueArr);
                if (movement.mockConsumeDieValueSix) {
                    diceValue = 0;
                    movement.mockConsumeDieValueSix = false;
                    movement.mockDiceId = "";
                }
                var path = this.logic.constructMockpath(mockPiece, diceValue);
                if (this.ruleEnforcer.mockPieceCollision(mockPiece.uniqueId, path.newIndex)) {
                    log.debug("END >>>>>>>>>>>>>>>>MOVE CAN PECK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + path.newIndex);
                    peckMove = movement;
                }
            }
        }
        else {
            log.debug("PIECE IS NULL.....................");
        }
        return peckMove;
    };
    AIPlayer.prototype.scanPerimeterForEnemies = function (movements) {
        return movements;
    };
    AIPlayer.prototype.isDefending = function () {
        return this.strategy === AIStrategy_1.AIStrategy.Defending;
    };
    AIPlayer.prototype.isDefault = function () {
        return this.strategy === AIStrategy_1.AIStrategy.Default;
    };
    return AIPlayer;
}(Player_1.Player));
exports.AIPlayer = AIPlayer;
