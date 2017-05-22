"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigLog4j_1 = require("../logging/ConfigLog4j");
var Player_1 = require("./Player");
var log = ConfigLog4j_1.factory.getLogger("model.RegularPlayer");
var RegularPlayer = (function (_super) {
    __extends(RegularPlayer, _super);
    function RegularPlayer(game, name, playerId, turn, colorTypes, signal, ludoPiece, ruleEnforcer, previousDoubleSix) {
        var _this = _super.call(this, game, name, playerId, turn, colorTypes, signal, ludoPiece, previousDoubleSix) || this;
        _this.isAI = false;
        return _this;
    }
    return RegularPlayer;
}(Player_1.Player));
exports.RegularPlayer = RegularPlayer;
