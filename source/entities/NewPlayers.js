"use strict";
var NewPlayer = (function () {
    function NewPlayer(playerName, color, isAI) {
        this.isCreator = false;
        this.color = color;
        this.playerName = playerName;
        this.isAI = isAI;
    }
    return NewPlayer;
}());
exports.NewPlayer = NewPlayer;
var NewPlayers = (function () {
    function NewPlayers() {
        this.playerMode = null;
        this.newPlayers = [];
        this.hasSavedGame = false;
        this.ludogame = null;
    }
    return NewPlayers;
}());
exports.NewPlayers = NewPlayers;
//# sourceMappingURL=NewPlayers.js.map