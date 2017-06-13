"use strict";
var EmitDie_1 = require("../emit/EmitDie");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Emit");
var Emit = (function () {
    function Emit() {
        this.emit = false;
        this.enableSocket = true;
        this.peckAndStay = true;
        this.emitDice = new EmitDie_1.EmitDie();
        this.opts = {
            lines: 13 // The number of lines to draw
            ,
            length: 28 // The length of each line
            ,
            width: 14 // The line thickness
            ,
            radius: 42 // The radius of the inner circle
            ,
            scale: 1 // Scales overall size of the spinner
            ,
            corners: 1 // Corner roundness (0..1)
            ,
            color: "#000" // #rgb or #rrggbb or array of colors
            ,
            opacity: 0.25 // Opacity of the lines
            ,
            rotate: 0 // The rotation offset
            ,
            direction: 1 // 1: clockwise, -1: counterclockwise
            ,
            speed: 1 // Rounds per second
            ,
            trail: 60 // Afterglow percentage
            ,
            fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            ,
            zIndex: 2e9 // The z-index (defaults to 2000000000)
            ,
            className: "spinner" // The CSS class to assign to the spinner
            ,
            top: "50%" // Top position relative to parent
            ,
            left: "39%" // Left position relative to parent
            ,
            shadow: false // Whether to render a shadow
            ,
            hwaccel: false
        };
        this.spinner = new Spinner(this.opts).spin();
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
    Emit.getInstance = function () {
        return Emit.emitInstance;
    };
    Emit.prototype.startSpinner = function () {
        var target = document.getElementById("spin");
        this.spinner.spin(target);
    };
    Emit.prototype.stopSpinner = function () {
        this.spinner.stop();
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
    Emit.prototype.getPeckAndStay = function () {
        return this.peckAndStay;
    };
    Emit.prototype.setPeckAndStay = function (peckAndStay) {
        this.peckAndStay = peckAndStay;
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
