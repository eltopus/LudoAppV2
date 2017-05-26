"use strict";
(function (States) {
    States[States["AtHome"] = 0] = "AtHome";
    States[States["Active"] = 1] = "Active";
    States[States["onWayOut"] = 2] = "onWayOut";
    States[States["Exited"] = 3] = "Exited";
})(exports.States || (exports.States = {}));
var States = exports.States;
