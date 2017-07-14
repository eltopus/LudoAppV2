import { FactoryLudoPlayer } from "./FactoryLudoPlayer";
import { FactoryLudoDice } from "./FactoryLudoDice";
import {States} from "../source/enums/States";
import {PlayerMode} from "../source/enums/PlayerMode";
import {LudoGameStatus} from "../source/enums/LudoGameStatus";

export class FactoryLudoGame {
    public ludoPlayers: FactoryLudoPlayer[] = [];
    public ludoDice: FactoryLudoDice;
    public gameId: string;
    public playerTurn = false;
    public availableColors = ["RED", "BLUE", "YELLOW", "GREEN"];
    public currrentPlayerId = "";
    public playerId = "";
    public status = LudoGameStatus.NEW;
    public playerMode: number = null;
    public indexTotal = 0;
    public originalLudoGame = "";
    public sequenceNumber = 0;
    public creatorPlayerId = "";
    public gameMode: PlayerMode;


}
