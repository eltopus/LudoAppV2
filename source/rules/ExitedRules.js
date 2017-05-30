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
var States_1 = require("../enums/States");
var log = ConfigLog4j_1.factory.getLogger("model.HomeRules");
var ExitedRules = (function (_super) {
    __extends(ExitedRules, _super);
    function ExitedRules(dice, schedule, board) {
        var _this = _super.call(this, dice, schedule, board) || this;
        _this.state = States_1.States.AtHome;
        return _this;
    }
    return ExitedRules;
}(AbstractRules_1.AbstractRules));
exports.ExitedRules = ExitedRules;
//# sourceMappingURL=ExitedRules.js.map