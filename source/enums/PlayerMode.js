"use strict";
(function (PlayerMode) {
    PlayerMode[PlayerMode["RegularTwoPlayer"] = 0] = "RegularTwoPlayer";
    PlayerMode[PlayerMode["RegularFourPlayer"] = 1] = "RegularFourPlayer";
    PlayerMode[PlayerMode["AiTwoPlayer"] = 2] = "AiTwoPlayer";
    PlayerMode[PlayerMode["AiFourPlayer"] = 3] = "AiFourPlayer";
    PlayerMode[PlayerMode["AiTwoPlayerAiVsAi"] = 4] = "AiTwoPlayerAiVsAi";
    PlayerMode[PlayerMode["AiFourPlayerAiVsAi"] = 5] = "AiFourPlayerAiVsAi";
})(exports.PlayerMode || (exports.PlayerMode = {}));
var PlayerMode = exports.PlayerMode;
//# sourceMappingURL=PlayerMode.js.map