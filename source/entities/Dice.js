"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Die_1 = require("./Die");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var angular2_uuid_1 = require("angular2-uuid");
var log = ConfigLog4j_1.factory.getLogger("model.Dice");
var Dice = (function () {
    function Dice(game, imageId, signal) {
        this.dieOneUniqueId = angular2_uuid_1.UUID.UUID();
        this.dieTwoUniqueId = angular2_uuid_1.UUID.UUID();
        this.dieOne = new Die_1.Die(game, 330, 390, imageId, this.dieOneUniqueId, signal);
        this.dieTwo = new Die_1.Die(game, 390, 330, imageId, this.dieTwoUniqueId, signal);
        this.signal = signal;
    }
    Dice.prototype.roll = function (playerId) {
        this.dieOne.roll(playerId);
        this.dieTwo.roll(playerId);
    };
    Dice.prototype.getHigherDieValue = function () {
        if (this.dieOne.getValue() > this.dieTwo.getValue()) {
            return this.dieOne.uniqueId;
        }
        else {
            return this.dieTwo.uniqueId;
        }
    };
    Dice.prototype.setDicePlayerId = function (playerId) {
        this.dieOne.setPlayerId(playerId);
        this.dieTwo.setPlayerId(playerId);
    };
    Dice.prototype.getDieByValue = function (value) {
        if (this.dieOne.getValue() === value) {
            return this.dieOne.uniqueId;
        }
        else if (this.dieTwo.getValue() === value) {
            return this.dieTwo.uniqueId;
        }
        else {
            return null;
        }
    };
    Dice.prototype.getDieValueByUniqueId = function (uniqueId) {
        var uniqueIds = [];
        var ids = uniqueId.split("#");
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            if (id === this.dieOne.uniqueId) {
                uniqueIds.push(this.dieOne.getValue());
                break;
            }
        }
        for (var _a = 0, ids_2 = ids; _a < ids_2.length; _a++) {
            var id = ids_2[_a];
            if (id === this.dieTwo.uniqueId) {
                uniqueIds.push(this.dieTwo.getValue());
                break;
            }
        }
        return uniqueIds;
    };
    return Dice;
}());
exports.Dice = Dice;
