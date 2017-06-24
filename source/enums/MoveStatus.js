"use strict";
(function (MoveStatus) {
    MoveStatus[MoveStatus["ShouldContinue"] = 0] = "ShouldContinue";
    MoveStatus[MoveStatus["IsRoundRobin"] = 1] = "IsRoundRobin";
    MoveStatus[MoveStatus["ShouldBeExiting"] = 2] = "ShouldBeExiting";
    MoveStatus[MoveStatus["Pecking"] = 3] = "Pecking";
    MoveStatus[MoveStatus["Passing"] = 4] = "Passing";
    MoveStatus[MoveStatus["Crossing"] = 5] = "Crossing";
    MoveStatus[MoveStatus["Ludoing"] = 6] = "Ludoing";
})(exports.MoveStatus || (exports.MoveStatus = {}));
var MoveStatus = exports.MoveStatus;
