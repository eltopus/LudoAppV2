"use strict";
/**
 * Defending means play piece from home that has least enemies behind lines
 */
(function (AIStrategy) {
    AIStrategy[AIStrategy["Default"] = 0] = "Default";
    AIStrategy[AIStrategy["Esacping"] = 1] = "Esacping";
    AIStrategy[AIStrategy["Trapping"] = 2] = "Trapping";
    AIStrategy[AIStrategy["MassAttack"] = 3] = "MassAttack";
    AIStrategy[AIStrategy["Defending"] = 4] = "Defending";
})(exports.AIStrategy || (exports.AIStrategy = {}));
var AIStrategy = exports.AIStrategy;
