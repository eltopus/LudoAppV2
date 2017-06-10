"use strict";
var EmitDie_1 = require("../emit/EmitDie");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Emit");
var Emit = (function () {
    function Emit() {
        this.emit = false;
        this.enableSocket = true;
        this.emitDice = new EmitDie_1.EmitDie();
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
    Emit.getInstance = function () {
        return Emit.emitInstance;
    };
    Emit.prototype.setGameIdText = function (gameIdText) {
        this.gameIdText = gameIdText;
    };
    // Emitters
    Emit.prototype.unselectActiveDie = function (die) {
        this.emitDice.setParameters(die);
        this.socket.emit("unselectActiveDie", this.emitDice);
    };
    Emit.prototype.selectActiveDie = function (die) {
        this.emitDice.setParameters(die);
        this.socket.emit("selectActiveDie", this.emitDice);
    };
    Emit.prototype.setSessionId = function (sessionId) {
        this.sessionId = sessionId;
    };
    Emit.prototype.getSessionId = function () {
        return this.sessionId;
    };
    Emit.prototype.setCurrentPlayerId = function (currentPlayerId) {
        this.currentPlayerId = currentPlayerId;
    };
    Emit.prototype.getCurrentPlayerId = function () {
        return this.currentPlayerId;
    };
    Emit.prototype.setEmit = function (emit) {
        this.emit = emit;
    };
    Emit.prototype.getEmit = function () {
        return this.emit;
    };
    Emit.prototype.setEnableSocket = function (enableSocket) {
        this.enableSocket = enableSocket;
    };
    Emit.prototype.getEnableSocket = function () {
        return this.enableSocket;
    };
    // Setters
    Emit.prototype.setScheduler = function (scheduler) {
        this.scheduler = scheduler;
    };
    Emit.prototype.setSocket = function (socket) {
        this.socket = socket;
    };
    Emit.prototype.setSignal = function (signal) {
        this.signal = signal;
    };
    Emit.prototype.getPieceByUniqueId = function (uniqueId) {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    };
    Emit.prototype.checkPlayerId = function (playerId) {
        if (playerId === this.currentPlayerId) {
            this.emit = true;
            this.gameIdText.fill = "#00ffff";
            log.debug("Setting emit to " + this.emit);
        }
        else {
            this.emit = false;
            this.gameIdText.fill = "#F70C0C";
            log.debug("Setting emit to " + this.emit);
        }
    };
    Emit.emitInstance = new Emit();
    return Emit;
}());
exports.Emit = Emit;
