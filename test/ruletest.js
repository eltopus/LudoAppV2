"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rule_1 = require("../rules/Rule");
var Actions_1 = require("../enums/Actions");
var chai_1 = require("chai");
describe("Rule Class", function () {
    it("should default to default", function () {
        var result = new Rule_1.Rule();
        result.action = Actions_1.Actions.PLAY;
        result.diceId = "123";
        result.playBothDice = true;
        result.pieceId = "456";
        chai_1.expect(result.action).to.equal(Actions_1.Actions.PLAY);
        chai_1.expect(result.diceId).to.equal("123");
        chai_1.expect(result.playBothDice).to.equal(true);
        chai_1.expect(result.pieceId).to.equal("456");
        result.resetRule();
        chai_1.expect(result.action).to.equal(Actions_1.Actions.DO_NOTHING);
        chai_1.expect(result.diceId).to.equal("");
        chai_1.expect(result.playBothDice).to.equal(false);
        chai_1.expect(result.pieceId).to.equal("");
    });
});
