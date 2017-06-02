"use strict";
(function (Actions) {
    Actions[Actions["PLAY"] = 0] = "PLAY";
    Actions[Actions["ROLL"] = 1] = "ROLL";
    Actions[Actions["SKIP"] = 2] = "SKIP";
    Actions[Actions["DO_NOTHING"] = 3] = "DO_NOTHING";
    Actions[Actions["EXIT"] = 4] = "EXIT";
})(exports.Actions || (exports.Actions = {}));
var Actions = exports.Actions;
