"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ColorType_1 = require("../enums/ColorType");
var States_1 = require("../enums/States");
var Movement_1 = require("../movement/Movement");
var PiecePosition_1 = require("../entities/PiecePosition");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Piece");
var Piece = (function (_super) {
    __extends(Piece, _super);
    function Piece(game, x, y, imageId, color, playerId, uniqueId, startPosition, signal) {
        var _this = _super.call(this, game, x, y, imageId) || this;
        _this.color = color;
        _this.playerId = playerId;
        _this.uniqueId = uniqueId;
        _this.startPosition = startPosition;
        _this.homePosition = new PiecePosition_1.PiecePosition(x, y);
        _this.game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.frame = 0;
        _this.index = -1;
        _this.entryIndex = _this.getEntryIndex();
        _this.startIndex = _this.getStartIndex(color);
        _this.state = States_1.States.AtHome;
        _this.group = _this.game.add.group();
        _this.group.add(_this);
        _this.signal = signal;
        _this.scale.x = 1.1;
        _this.scale.y = 1.1;
        _this.anchor.x = -0.07;
        _this.anchor.y = -0.07;
        _this.inputEnabled = true;
        _this.movement = new Movement_1.Move();
        _this.speedConstant = 6000 * 12;
        _this.events.onInputDown.add(_this.setActivePiece, _this);
        return _this;
    }
    Piece.prototype.movePiece = function (newIndex) {
        if (this.isAtHome()) {
            this.index = this.startIndex;
        }
        var path = this.movement.constructActivePath(this, newIndex);
        if (path.isEmpty()) {
            log.debug("Path is empty! Nothing to do...");
        }
        else {
            this.index = path.newIndex;
            this.signal.dispatch("eom", this);
            this.game.world.bringToTop(this.group);
            var speed = this.getSpeed(path.x.length);
            this.movePieceTo(path, speed);
        }
    };
    Piece.prototype.movePieceTo = function (path, speed) {
        var tween = this.game.add.tween(this).to(path, 1000, Phaser.Easing.Linear.None, true).interpolation(function (v, k) {
            return Phaser.Math.linearInterpolation(v, k);
        });
        tween.onComplete.add(this.onCompleteMovementBackToHome, this);
    };
    Piece.prototype.onCompleteMovementBackToHome = function () {
        log.debug("My index is " + this.index + " my state is " + this.getState());
    };
    Piece.prototype.moveToHome = function () {
        var path = this.movement.constructHomePath(this, this.index, this.index);
        if (!path.isEmpty) {
            this.signal.dispatch("backToHome", this);
            this.index = path.newIndex;
            this.game.world.bringToTop(this.group);
            this.game.add.tween(this).to({ x: path.x, y: path.y }, 6000, Phaser.Easing.Linear.None, true);
        }
        else {
            log.debug("Path is empty.");
        }
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
    };
    Piece.prototype.setActive = function () {
        this.state = States_1.States.Active;
    };
    Piece.prototype.setExited = function () {
        this.state = States_1.States.Exited;
    };
    Piece.prototype.setOnWayOut = function () {
        this.state = States_1.States.onWayOut;
    };
    Piece.prototype.isAtEntryPoint = function () {
        return (this.index === this.entryIndex);
    };
    Piece.prototype.setActivePiece = function () {
        this.signal.dispatch("select", this.uniqueId, this.playerId);
    };
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
