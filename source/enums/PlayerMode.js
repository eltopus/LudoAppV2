"use strict";
(function (PlayerMode) {
    PlayerMode[PlayerMode["RegularTwoPlayer"] = 0] = "RegularTwoPlayer";
    PlayerMode[PlayerMode["RegularFourPlayer"] = 1] = "RegularFourPlayer";
    PlayerMode[PlayerMode["AiTwoPlayer"] = 2] = "AiTwoPlayer";
    PlayerMode[PlayerMode["AiFourPlayer"] = 3] = "AiFourPlayer";
    PlayerMode[PlayerMode["AiTwoPlayerAiVsAi"] = 4] = "AiTwoPlayerAiVsAi";
    PlayerMode[PlayerMode["AiFourPlayerAiVsAi"] = 5] = "AiFourPlayerAiVsAi";
    PlayerMode[PlayerMode["SinglePlayer"] = 6] = "SinglePlayer";
    PlayerMode[PlayerMode["Multiplayer"] = 7] = "Multiplayer";
    PlayerMode[PlayerMode["Default"] = 8] = "Default";
})(exports.PlayerMode || (exports.PlayerMode = {}));
var PlayerMode = exports.PlayerMode;
