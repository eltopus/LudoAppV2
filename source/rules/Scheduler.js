"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collections = require("typescript-collections");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Scheduler");
var Scheduler = (function () {
    function Scheduler() {
        this.schedule = new Collections.Queue();
    }
    Scheduler.prototype.getNextPlayer = function () {
        var player = this.schedule.dequeue();
        this.schedule.enqueue(player);
        return player;
    };
    Scheduler.prototype.getCurrentPlayer = function () {
        return (this.schedule.peek());
    };
    return Scheduler;
}());
exports.Scheduler = Scheduler;
