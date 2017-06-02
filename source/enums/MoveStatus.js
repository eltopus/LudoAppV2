"use strict";
(function (MoveStatus) {
    MoveStatus[MoveStatus["ShouldContinue"] = 0] = "ShouldContinue";
    MoveStatus[MoveStatus["IsRoundRobin"] = 1] = "IsRoundRobin";
    MoveStatus[MoveStatus["ShouldBeExiting"] = 2] = "ShouldBeExiting";
})(exports.MoveStatus || (exports.MoveStatus = {}));
var MoveStatus = exports.MoveStatus;
