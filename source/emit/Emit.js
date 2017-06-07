"use strict";
var Emit = (function () {
    function Emit() {
        this.emit = false;
        this.enableSocket = true;
        if (Emit.emitInstance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        Emit.emitInstance = this;
    }
    Emit.getInstance = function () {
        return Emit.emitInstance;
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
    Emit.prototype.setScheduler = function (scheduler) {
        this.scheduler = scheduler;
    };
    Emit.prototype.getPieceByUniqueId = function (uniqueId) {
        return this.scheduler.getPieceByUniqueId(uniqueId);
    };
    Emit.emitInstance = new Emit();
    return Emit;
}());
exports.Emit = Emit;
