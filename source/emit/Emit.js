"use strict";
exports.__esModule = true;
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
    return Emit;
}());
Emit.emitInstance = new Emit();
exports.Emit = Emit;
