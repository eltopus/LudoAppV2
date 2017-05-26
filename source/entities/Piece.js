"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
var ColorType_1 = require("../enums/ColorType");
var States_1 = require("../enums/States");
var Movement_1 = require("../movement/Movement");
var PiecePosition_1 = require("../entities/PiecePosition");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Path_1 = require("../entities/Path");
// import * as Phasertips from "../Phasertips";
var log = ConfigLog4j_1.factory.getLogger("model.Piece");
var Piece = (function (_super) {
    __extends(Piece, _super);
    // public tips: Phasertips;
    function Piece(game, x, y, imageId, color, playerId, uniqueId, startPosition, signal) {
        _super.call(this, game, x, y, imageId);
        this.color = color;
        this.playerId = playerId;
        this.uniqueId = uniqueId;
        this.startPosition = startPosition;
        this.homePosition = new PiecePosition_1.PiecePosition(x, y);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.frame = 0;
        this.index = -1;
        this.entryIndex = this.getEntryIndex();
        this.startIndex = this.getStartIndex(color);
        this.state = States_1.States.AtHome;
        this.group = this.game.add.group();
        this.group.add(this);
        this.signal = signal;
        this.scale.x = 1.1;
        this.scale.y = 1.1;
        this.anchor.x = -0.07;
        this.anchor.y = -0.07;
        this.inputEnabled = true;
        this.movement = new Movement_1.PieceMovement(signal);
        this.speedConstant = 6000 * 12;
        this.collidingPiece = null;
        this.imageId = imageId;
        // this.tips = new Phasertips(game, {targetObject: this, context: this.uniqueId, strokeColor: 0xff0000 });
        this.events.onInputDown.add(this.setActivePiece, this);
    }
    Piece.prototype.constructPath = function (newIndex) {
        var path = new Path_1.Path();
        if (this.isOnWayOut()) {
            path = this.movement.constructOnWayOutPath(this, this.index, newIndex);
        }
        if (this.isActive() || this.isAtHome()) {
            path = this.movement.constructActivePath(this, newIndex);
        }
        return path;
    };
    Piece.prototype.movePiece = function (path) {
        this.signal.dispatch("startmovement", this);
        this.game.world.bringToTop(this.group);
        var speed = this.getSpeed(path.x.length);
        this.movePieceTo(path, speed);
    };
    Piece.prototype.onCompleteMovement = function () {
        if (this.collidingPiece !== null) {
            this.collidingPiece.moveToHome();
            this.collidingPiece = null;
        }
        if (this.isExited()) {
            this.visible = false;
        }
        this.signal.dispatch("completeMovement", this);
    };
    /**
     * Moves piece to homePosition
     * Sends backToHome signal to Game and Board child classes
     */
    Piece.prototype.moveToHome = function () {
        this.game.world.bringToTop(this.group);
        this.game.add.tween(this).to({ x: this.homePosition.x, y: this.homePosition.y }, 1000, Phaser.Easing.Linear.None, true);
    };
    Piece.prototype.getSpeed = function (distance) {
        return Math.floor(this.speedConstant / distance);
    };
    Piece.prototype.isAtHome = function () {
        return (this.state === States_1.States.AtHome);
    };
    Piece.prototype.isActive = function () {
        return (this.state === States_1.States.Active);
    };
    Piece.prototype.isOnWayOut = function () {
        return (this.state === States_1.States.onWayOut);
    };
    Piece.prototype.isExited = function () {
        return (this.state === States_1.States.Exited);
    };
    Piece.prototype.setAtHome = function () {
        this.state = States_1.States.AtHome;
        this.index = -1;
        this.signal.dispatch("backToHome", this);
    };
    Piece.prototype.setActive = function () {
        this.state = States_1.States.Active;
        this.signal.dispatch("rom", this);
    };
    Piece.prototype.setExited = function () {
        this.state = States_1.States.Exited;
        this.signal.dispatch("exit", this);
    };
    Piece.prototype.setExitedWithoutDispatch = function () {
        this.state = States_1.States.Exited;
        this.visible = false;
    };
    Piece.prototype.setCollisionExited = function () {
        this.state = States_1.States.Exited;
    };
    Piece.prototype.setOnWayOut = function () {
        this.state = States_1.States.onWayOut;
        this.signal.dispatch("onwayout", this);
    };
    Piece.prototype.isAtEntryPoint = function () {
        return (this.index === this.entryIndex);
    };
    /**
     * Dispatches select signal to player
     * Player and piece must have the same player id
     * @param uniqueId
     */
    Piece.prototype.setActivePiece = function () {
        this.signal.dispatch("select", this.uniqueId, this.playerId);
    };
    /**
     * Dispatches select signal to player
     * Player and piece must have the same player id
     * @param uniqueId
     */
    Piece.prototype.unsetActivePiece = function () {
        this.signal.dispatch("unselect", this.uniqueId, this.playerId);
        this.frame = 0;
    };
    Piece.prototype.select = function () {
        this.frame = 1;
    };
    Piece.prototype.unselect = function () {
        this.frame = 0;
    };
    Piece.prototype.ifYouAre = function (color) {
        return (color === this.color);
    };
    Piece.prototype.getEntryIndex = function () {
        switch (this.color) {
            case ColorType_1.ColorType.Red:
                return 51;
            case ColorType_1.ColorType.Blue:
                return 12;
            case ColorType_1.ColorType.Yellow:
                return 25;
            case ColorType_1.ColorType.Green:
                return 38;
            default:
                return -1;
        }
    };
    Piece.prototype.getColor = function () {
        switch (this.color) {
            case ColorType_1.ColorType.Red:
                return "RED";
            case ColorType_1.ColorType.Blue:
                return "BLUE";
            case ColorType_1.ColorType.Yellow:
                return "YELLOW";
            case ColorType_1.ColorType.Green:
                return "GREEN";
            default:
                return "";
        }
    };
    Piece.prototype.getState = function () {
        switch (this.state) {
            case States_1.States.Active:
                return "ACTIVE";
            case States_1.States.AtHome:
                return "AT HOME";
            case States_1.States.Exited:
                return "EXITED";
            case States_1.States.onWayOut:
                return "ON WAY OUT";
            default:
                return "";
        }
    };
    Piece.prototype.setParameters = function (x, y, index, state) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.index = index;
    };
    Piece.prototype.getPerimeter = function () {
        switch (this.color) {
            case ColorType_1.ColorType.Red:
                return 47;
            case ColorType_1.ColorType.Blue:
                return 8;
            case ColorType_1.ColorType.Yellow:
                return 21;
            case ColorType_1.ColorType.Green:
                return 34;
            default:
                return 0;
        }
    };
    Piece.prototype.isRed = function () {
        return this.color === ColorType_1.ColorType.Red;
    };
    Piece.prototype.isBlue = function () {
        return this.color === ColorType_1.ColorType.Blue;
    };
    Piece.prototype.isYellow = function () {
        return this.color === ColorType_1.ColorType.Yellow;
    };
    Piece.prototype.isGreen = function () {
        return this.color === ColorType_1.ColorType.Green;
    };
    Piece.prototype.isWithinHomePerimeters = function (piece) {
        var withinPerimeter = false;
        if (this.isActive() && (this.index >= piece.getPerimeter()) && (this.index <= (piece.entryIndex + 1))) {
            withinPerimeter = true;
        }
        if (this.isActive() && (piece.isRed()) && this.index === 0) {
            withinPerimeter = true;
        }
        return withinPerimeter;
    };
    Piece.prototype.isWithinPerimeters = function (piece) {
        var withinPerimeter = false;
        if (this.isActive() && (this.index >= piece.getPerimeter()) && (this.index <= (piece.entryIndex + 1))) {
            withinPerimeter = true;
        }
        if (this.isActive() && (piece.isRed()) && this.index === 0) {
            withinPerimeter = true;
        }
        return withinPerimeter;
    };
    Piece.prototype.numberOfEnemiesWithinPerimeter = function (perimeters) {
        var withinPerimeter = 0;
        for (var _i = 0, perimeters_1 = perimeters; _i < perimeters_1.length; _i++) {
            var perimeter = perimeters_1[_i];
            if (perimeter.pieceIndex >= this.getPerimeter() && perimeter.pieceIndex <= (this.entryIndex + 1)) {
                ++withinPerimeter;
            }
            if (this.isRed() && perimeter.pieceIndex === 0) {
                ++withinPerimeter;
            }
        }
        return withinPerimeter;
    };
    Piece.prototype.getCurrentPiecePostionByIndex = function () {
        var piecePosition = null;
        if (this.isActive()) {
            piecePosition = this.movement.activePath.getPiecePostionByIndex(this.index);
        }
        else if (this.isOnWayOut()) {
            piecePosition = this.movement.onWayOutPaths.getPiecePostionByIndex(this, this.index);
        }
        else {
            piecePosition = this.homePosition;
        }
        return piecePosition;
    };
    Piece.prototype.movePieceTo = function (path, speed) {
        var tween = this.game.add.tween(this).to(path, 1000, Phaser.Easing.Linear.None, true).interpolation(function (v, k) {
            return Phaser.Math.linearInterpolation(v, k);
        });
        tween.onComplete.add(this.onCompleteMovement, this);
    };
    Piece.prototype.getStartIndex = function (color) {
        switch (color) {
            case ColorType_1.ColorType.Red:
                return 1;
            case ColorType_1.ColorType.Blue:
                return 14;
            case ColorType_1.ColorType.Yellow:
                return 27;
            case ColorType_1.ColorType.Green:
                return 40;
            default:
                return 0;
        }
    };
    return Piece;
}(Phaser.Sprite));
exports.Piece = Piece;
