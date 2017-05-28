"use strict";
var Emit = (function () {
    function Emit() {
        this.emit = false;
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
    Emit.emitInstance = new Emit();
    return Emit;
}());
exports.Emit = Emit;
