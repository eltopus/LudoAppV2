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
var AbstractRules_1 = require("./AbstractRules");
var log = ConfigLog4j_1.factory.getLogger("model.OnWayOutRules");
var OnWayOutRules = (function (_super) {
    __extends(OnWayOutRules, _super);
    function OnWayOutRules(dice, schedule, board) {
        return _super.call(this, dice, schedule, board) || this;
    }
    OnWayOutRules.prototype.generateRules = function (player) {
        var rules = [];
        return rules;
    };
    return OnWayOutRules;
}(AbstractRules_1.AbstractRules));
exports.OnWayOutRules = OnWayOutRules;
