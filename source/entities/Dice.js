"use strict";
var Die_1 = require("./Die");
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var log = ConfigLog4j_1.factory.getLogger("model.Dice");
var Dice = (function () {
    function Dice(game, imageId, signal, dieOneUUID, dieTwoUUID, socket, gameId) {
        this.previousDoubleSix = false;
        this.dieOne = new Die_1.Die(game, 330, 390, imageId, dieOneUUID, signal, socket, gameId);
        this.dieTwo = new Die_1.Die(game, 390, 330, imageId, dieTwoUUID, signal, socket, gameId);
        this.signal = signal;
    }
    Dice.prototype.roll = function (value1, value2) {
        this.dieOne.roll(value1);
        this.dieTwo.roll(value2);
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
    /**
     * Returns the uniqueId of the first occurrence
     * of the die matching the value
     * @param value
     */
    Dice.prototype.getDieUniqueIdByValue = function (value) {
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
    /**
     * Returns an array of dice values
     * @param uniqueId
     */
    Dice.prototype.getDieValueArrayByUniqueId = function (uniqueId) {
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
    /**
     * Returns an array of uniqueIds of selected dice
     */
    Dice.prototype.getSelectedDiceUniqueIds = function () {
        var diceUniqueIds = [];
        if (this.dieOne.isSelected()) {
            diceUniqueIds.push(this.dieOne.uniqueId);
        }
        if (this.dieTwo.isSelected()) {
            diceUniqueIds.push(this.dieTwo.uniqueId);
        }
        return diceUniqueIds;
    };
    Dice.prototype.consumeDieValueSix = function (uniqueId) {
        var ids = uniqueId.split("#");
        for (var _i = 0, ids_3 = ids; _i < ids_3.length; _i++) {
            var id = ids_3[_i];
            if (id === this.dieOne.uniqueId && this.dieOne.equalsValueSix()) {
                this.dieOne.consume();
                break;
            }
            if (id === this.dieTwo.uniqueId && this.dieTwo.equalsValueSix()) {
                this.dieTwo.consume();
                break;
            }
        }
    };
    Dice.prototype.consumeDieValueById = function (uniqueId) {
        var ids = uniqueId.split("#");
        for (var _i = 0, ids_4 = ids; _i < ids_4.length; _i++) {
            var id = ids_4[_i];
            if (id === this.dieOne.uniqueId) {
                this.dieOne.consume();
            }
            if (id === this.dieTwo.uniqueId) {
                this.dieTwo.consume();
            }
        }
    };
    Dice.prototype.consumeDice = function () {
        this.dieOne.consume();
        this.dieTwo.consume();
    };
    Dice.prototype.isDieOneConsumed = function () {
        return this.dieOne.isConsumed();
    };
    Dice.prototype.isDieTwoConsumed = function () {
        return this.dieTwo.isConsumed();
    };
    Dice.prototype.bothDiceConsumed = function () {
        return (this.dieOne.isConsumed() && this.dieTwo.isConsumed());
    };
    /**
     * Returns true if one of the dice value is 6
     */
    Dice.prototype.rolledAtLeastOneSix = function () {
        return (this.dieOne.getValue() === 6 || this.dieTwo.getValue() === 6);
    };
    /**
     * Returns true if both dice values are 6 and 6
     */
    Dice.prototype.rolledDoubleSix = function () {
        return (this.dieOne.getValue() === 6 && this.dieTwo.getValue() === 6);
    };
    /**
     * Returns true if both dice values are greater than 0
     */
    Dice.prototype.bothDiceHasLegitValues = function () {
        return (this.dieOne.getValue() > 0 && this.dieTwo.getValue() > 0);
    };
    Dice.prototype.hasSameDiceValues = function () {
        return (this.dieOne.getValue() === this.dieTwo.getValue());
    };
    return Dice;
}());
exports.Dice = Dice;
