"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Player_1 = require("./Player");
var log = ConfigLog4j_1.factory.getLogger("model.RegularPlayer");
var RegularPlayer = (function (_super) {
    __extends(RegularPlayer, _super);
    function RegularPlayer(game, name, playerId, turn, colorTypes, signal, ludoPiece, ruleEnforcer, previousDoubleSix) {
        _super.call(this, game, name, playerId, turn, colorTypes, signal, ludoPiece, previousDoubleSix);
        this.isAI = false;
    }
    return RegularPlayer;
}(Player_1.Player));
exports.RegularPlayer = RegularPlayer;
//# sourceMappingURL=RegularPlayer.js.map