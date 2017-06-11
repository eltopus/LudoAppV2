/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {AIPlayer} from "../entities/AIPlayer";
import {Player} from "../entities/Player";
import {RegularPlayer} from "../entities/RegularPlayer";
import {ColorType} from "../enums/ColorType";
import {ActiveBoard} from "../entities/ActiveBoard";
import {HomeBoard} from "../entities/HomeBoard";
import {OnWayOutBoard} from "../entities/OnWayOutBoard";
import {ExitedBoard} from "../entities/ExitedBoard";
import {AllPossibleMoves} from "../rules/AllPossibleMoves";
import {Dice} from "../entities/Dice";
import {Rules} from "../rules/Rules";
import {factory} from "../logging/ConfigLog4j";
import {Scheduler} from "../rules/Scheduler";
import {RuleEnforcer} from "../rules/RuleEnforcer";
import * as Paths from "../entities/Paths";
import {States} from "../enums/States";
import {PlayerMode} from "../enums/PlayerMode";
import {Board} from "../entities/Board";
import {PiecePosition} from "../entities/PiecePosition";
import {Move} from "../rules/Move";
import {LudoGame} from "../game/LudoGame";
import {LudoPlayer} from "../game/LudoPlayer";
import {NewPlayers} from "../entities/NewPlayers";
import {Emit} from "../emit/Emit";
import {LocalGame} from "../game/LocalGame";
import {Dictionary} from "typescript-collections";
import * as $ from "jquery";
import * as cio from "socket.io-client";

const log = factory.getLogger("model.Game");

let emit = Emit.getInstance();
let Display = Example;
export class Game extends Phaser.State {
    public dice: Dice;
    public signal: Phaser.Signal;
    public enforcer: RuleEnforcer;
    public scheduler: Scheduler;
    private players: Player[] = [];
    private playerMode: PlayerMode;
    private newPlayers: NewPlayers;
    private gameId: string;
    private socket: any = null;
    private isCreator = false;
    private localGame: LocalGame;
    private currentPlayerName: string;
    private playerNames = new Dictionary<String, any>();

    public init(newPlayers: NewPlayers) {
        this.newPlayers = newPlayers;
        if (this.newPlayers.hasSavedGame) {
            this.gameId = newPlayers.ludogame.gameId;
            this.playerMode = newPlayers.ludogame.playerMode;
        }else {
            this.isCreator = newPlayers.isCreator;
            this.gameId = this.generateGameId(5);
            this.currentPlayerName = this.newPlayers.playerName;
            this.playerMode = newPlayers.playerMode;
        }
    }

    public create() {

        let board = this.add.sprite(0, 0, "board");
        this.signal = new Phaser.Signal();
        this.localGame = new LocalGame(this.signal);
        let activeboard: ActiveBoard = new ActiveBoard(this.signal);
        let homeboard: HomeBoard = new HomeBoard(this.signal);
        let onWayOutBoard: OnWayOutBoard = new OnWayOutBoard(this.signal);
        let exitedBoard: ExitedBoard = new ExitedBoard(this.signal);
        let currentPossibleMovements: AllPossibleMoves = new AllPossibleMoves();


        let playBtn = this.make.button(763, 540, "play", this.playDice, this, 2, 1, 0);
        let buttonGroup = this.add.group();
        buttonGroup.add(playBtn);
        let diceBtn = this.make.button(770, 440, "diceBtn", this.rollDice, this, 2, 1, 0);
        diceBtn.alpha = 0.5;
        diceBtn.scale.x = 0.2;
        diceBtn.scale.y = 0.2;
        buttonGroup.add(diceBtn);
        let reportBtn = this.make.button(730, 320, "report", this.fullScreen, this, 2, 1, 0);
        reportBtn.alpha = 0.5;
        reportBtn.scale.x = 0.3;
        reportBtn.scale.y = 0.3;
        buttonGroup.add(reportBtn);
        let updateBtn = this.make.button(810, 323, "updateBtn", this.saveGame, this, 2, 1, 0);
        updateBtn.alpha = 0.5;
        updateBtn.scale.x = 0.6;
        updateBtn.scale.y = 0.6;
        buttonGroup.add(updateBtn);
        this.game.stage.disableVisibilityChange = true;

        if (this.newPlayers.hasSavedGame) {
            if (emit.getEnableSocket()) {
                this.socket = cio();
            }
            this.localGame.setLudoGame(this.newPlayers.ludogame);
            let dieOneUUID = this.newPlayers.ludogame.ludoDice.dieOne.uniqueId;
            let dieTwoUUID = this.newPlayers.ludogame.ludoDice.dieTwo.uniqueId;
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.newPlayers.ludogame.gameId);
            this.dice.dieOne.setDieFrame(this.newPlayers.ludogame.ludoDice.dieOne);
            this.dice.dieTwo.setDieFrame(this.newPlayers.ludogame.ludoDice.dieTwo);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.newPlayers.ludogame.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard,
            onWayOutBoard, exitedBoard, this.newPlayers.ludogame.gameId, this.socket, currentPossibleMovements);
            for (let ludoPlayer of this.newPlayers.ludogame.ludoPlayers){
                if (ludoPlayer !== null && typeof ludoPlayer !== "undefined") {
                    let player = this.createExistingPlayer(ludoPlayer);
                    this.scheduler.enqueue(player);
                    for (let piece of player.pieces){
                        if (piece.isAtHome()) {
                            homeboard.addPieceToHomeBoard(piece);
                        }
                        if (piece.isActive()) {
                            activeboard.addPieceToActiveBoard(piece);
                        }
                        if (piece.isOnWayOut()) {
                            onWayOutBoard.addPieceToOnWayOutBoard(piece);
                        }
                        if (piece.isExited()) {
                            piece.setExitedWithoutDispatch();
                            exitedBoard.addPieceToActiveBoard(piece);
                        }
                    }
                    this.players.push(player);
                }
            }
            this.setSocketHandlers();
            this.displayGameId(this.newPlayers.ludogame.gameId);
            this.joinExistingGame();

        }else {
            if (emit.getEnableSocket()) {
                this.socket = cio();
            }
            let dieOneUUID = UUID.UUID();
            let dieTwoUUID = UUID.UUID();
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.gameId);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.scheduler, this.dice, activeboard, homeboard,
            onWayOutBoard, exitedBoard, this.gameId, this.socket, currentPossibleMovements);
            let players: Player[] = this.createNewPlayers(this.newPlayers);
            for (let player of players) {
                this.scheduler.enqueue(player);
                this.players.push(player);
                for (let piece of player.pieces){
                    homeboard.addPieceToHomeBoard(piece);
                }
            }
            this.setSocketHandlers();
            this.createGame();
        }


    }

    public rollDice(): void {
        this.dice.setDicePlayerId(this.enforcer.scheduler.getCurrentPlayer().playerId);
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice);
        // log.debug(" Emiiter show me: " + emit.getEmit());
    }

    public playDice(): void {
        let dieIds = this.dice.getSelectedDiceUniqueIds();
        let player = this.scheduler.getCurrentPlayer();

        if (player.currentSelectedPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentSelectedPiece);
        }else {
            log.debug("No die selected or no piece selected");
        }
    }

    public update(): void {
        //
    }

    private displayGameId(gameId: string): void {
        let gameIdText = this.game.add.text(0, 0, gameId, {font: "30px Revalia", fill: "#00ffff", boundsAlignH: "center", boundsAlignV: "middle"});
        gameIdText.setTextBounds(720, 290, 175, 30);
        emit.setGameIdText(gameIdText);
    }

    private setActivePieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.ActivePath();
        let position = path.getPiecePostionByIndex(index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

    private setOnWayOutPieceParameters(piece: Piece, index: number, state: States, board: Board): void {
        let path = new Paths.OnWayOutPaths();
        let position = path.getPiecePostionByIndex(piece, index);
        piece.setParameters(position.x, position.y, index, state);
        board.board.setValue(piece.uniqueId, index);
    }

    private waitUntilGameStarts(): void {

        // this.dice.setDicePlayerId(this.scheduler.getCurrentPlayer().playerId);
        // log.debug(" Emit is " + emit.getEmit());
        if (this.scheduler.getCurrentPlayer().isAI) {
            log.debug("Hey I am AI " + emit.getEmit());
            if (this.dice.bothDiceConsumed() ) {
                if (emit.getEmit()) {
                    this.signal.dispatch("aiRollDice", this.dice, this.scheduler.getCurrentPlayer().playerId);
                }
            }else {
                this.enforcer.setRollCounter(1);
                this.enforcer.endOfDiceRoll("endOfDieRoll");
            }
        }else if (this.scheduler.getCurrentPlayer().isAI === false && this.dice.bothDiceConsumed() === false) {
            this.enforcer.setRollCounter(1);
            this.enforcer.endOfDiceRoll("endOfDieRoll");
        }
        this.enforcer.rule.checkBoardConsistencies();
    }


    private ireport(): void {
        //
    }

    private saveGame(): void {
        let ludoGame = new LudoGame(this.players, this.dice, this.gameId);
        log.debug(JSON.stringify(ludoGame, null, "\t"));
        log.debug(JSON.stringify(ludoGame));
    }

    private createGame(): void {
        let ludogame = new LudoGame(this.players, this.dice, this.gameId);
        // first player is always the creator's player
        ludogame.ludoPlayers[0].playerName = this.currentPlayerName;
        ludogame.availableColors = this.getAvailableColors(ludogame.ludoPlayers[0].colors, ludogame);
        emit.setCurrentPlayerId(ludogame.ludoPlayers[0].playerId);
        ludogame.currrentPlayerId = ludogame.ludoPlayers[0].playerId;
        ludogame.playerMode = this.getPlayerMode();
        this.displayGameId(ludogame.gameId);
        if (emit.getEnableSocket()) {
            this.socket.emit("createGame", ludogame, (data: any) => {
                if (data.ok) {
                    emit.setEmit(data.emit);
                    // Display.show(data.message);
                    this.displayNames(ludogame);
                    this.waitForPlayers(ludogame);
                    log.debug(data.message + " playerId: " + emit.getCurrentPlayerId());
                    this.waitUntilGameStarts();
                }
            });
        }
    }

    private joinExistingGame(): void {
        this.currentPlayerName = this.scheduler.getPlayerName(emit.getCurrentPlayerId());
        if (emit.getEnableSocket()) {
            log.debug(" playerId before : " + emit.getCurrentPlayerId());
            this.socket.emit("joinExistingGame", (data: any) => {
                if (data.ok) {
                    Display.show(data.message);
                    emit.checkPlayerId(data.currrentPlayerId);
                    this.displayNames(this.newPlayers.ludogame);
                    this.waitForPlayers(this.newPlayers.ludogame);
                    log.debug(data.message + " playerId: " + emit.getCurrentPlayerId());
                    this.waitUntilGameStarts();
                }
            });
        }
    }

    private getAvailableColors(chosenColors: string[], ludogame: LudoGame): string[] {
        let availableColors: string[] = [];
        for (let y = 0; y <  ludogame.availableColors.length; ++y) {
            if (!this.containsColor(chosenColors, ludogame.availableColors[y])) {
                availableColors.push(ludogame.availableColors[y]);
            }
        }
        return availableColors;
    }

    private containsColor(colors: string[], color: string): boolean {
        let contains = false;
        for (let c of colors){
            if (c === color) {
                contains = true;
            }
        }
        return contains;
    }

    private createNewPlayers(newPlayers: NewPlayers): Player[] {
        let players: Player[] = [];
        for (let newPlayer of newPlayers.newPlayers){
            if (newPlayer.isAI) {
                let aiPlayer = new AIPlayer(this.game, UUID.UUID(), true, newPlayer.color, this.signal, "", this.socket, this.gameId, null, this.enforcer);
                players.push(aiPlayer);
            }else {
                let regularPlayer = new RegularPlayer(this.game, UUID.UUID(), true, newPlayer.color, this.signal, "", this.socket, this.gameId, null, this.enforcer);
                players.push(regularPlayer);
            }
        }
        return players;
    }

    private createExistingPlayer(ludoPlayer: LudoPlayer): Player {
        let player: Player = null;
        if (ludoPlayer.isAI) {
            player = new AIPlayer(this.game, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
            this.signal, ludoPlayer.playerName, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }else {
            player = new RegularPlayer(this.game, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
            this.signal, ludoPlayer.playerName, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
        }
        return player;
    }

    private fullScreen(): void {
        if (this.scale.isFullScreen) {
            this.scale.stopFullScreen();
        }else {
            this.scale.startFullScreen(false);
        }
    }

    private generateGameId(length: number): string {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }

    private displayNames(ludogame: LudoGame): void {
        for (let player of ludogame.ludoPlayers) {
            for (let color of player.colors){
                switch (color) {
                    case "RED": {
                        let playerNameObj = this.displayPlayerName(70, 30, player.playerName);
                        this.playerNames.setValue("RED", playerNameObj);
                        break;
                    }
                    case "BLUE": {
                        let playerNameObj = this.displayPlayerName(650, 30, player.playerName);
                        this.playerNames.setValue("BLUE", playerNameObj);
                        break;
                    }
                    case "YELLOW": {
                        let playerNameObj = this.displayPlayerName(650, 700, player.playerName);
                        this.playerNames.setValue("YELLOW", playerNameObj);
                        break;
                    }
                    case "GREEN": {
                        let playerNameObj = this.displayPlayerName(70, 700, player.playerName);
                        this.playerNames.setValue("GREEN", playerNameObj);
                        break;
                    }
                    default:
                    break;
                }
            }
        }
        this.localGame.setLudoGame(ludogame);
        this.updatePlayername(ludogame.ludoPlayers);
    }

    private updatePlayername(ludoplayers: LudoPlayer[]): void {
        for (let player of this.players) {
            player.updatePlayerName(ludoplayers);
        }
    }

    private displayPlayerName(x: number, y: number, playerName: string): any {

        let playerNameText = this.game.add.text(x, y, playerName, {});
        playerNameText.anchor.setTo(0.5);
		playerNameText.font = "Revalia";
		playerNameText.fontSize = 20;
	    let grd = playerNameText.context.createLinearGradient(0, 0, 0, playerNameText.canvas.height);
		grd.addColorStop(0, "#8ED6FF");
		grd.addColorStop(1, "#004CB3");
		playerNameText.fill = grd;
        playerNameText.align = "center";
		playerNameText.stroke = "#000000";
		playerNameText.strokeThickness = 2;
		playerNameText.setShadow(5, 5, "rgba(0,0,0,0.5)", 5);
        playerNameText.inputEnabled = true;
		playerNameText.input.enableDrag();
        return playerNameText;
    }

    private setSocketHandlers(): void {
        this.socket.on("updateJoinedPlayer", (ludogame: any, playerName: string) => {
            Display.show(`${playerName} has joined game`);
            this.displayNames(ludogame);
        });
    }

    private getPlayerMode(): number {
        let mode = 0;
        if (this.playerMode === PlayerMode.AiFourPlayer || this.playerMode === PlayerMode.AiFourPlayerAiVsAi || this.playerMode === PlayerMode.RegularFourPlayer) {
            mode = 4;
        }else if (this.playerMode === PlayerMode.AiTwoPlayer || this.playerMode === PlayerMode.AiTwoPlayerAiVsAi || this.playerMode === PlayerMode.RegularTwoPlayer) {
            mode = 2;
        }
        return mode;
    }

    private waitForPlayers(ludogame: LudoGame): void {
        /*
        bootbox.dialog({
					message: '<div class="row">'+
                        '<div class="col-sm-6 col-sm-offset-3 form-box">'+
                            '<div class="form-bottom contact-form">' +
			                    '<form role="form">' +
			                    	'<div class="form-group">' +
			                        	'<textarea id="player0" class="form-control" placeholder="Waiting..."></textarea>' +
			                        '</div>' +
			                        '<div class="form-group">' +
			                        	'<textarea id="player1" class="form-control" placeholder="Waiting..."></textarea>' +
			                        '</div>' +
                                    '<div class="form-group">' +
			                        	'<textarea id="player2" class="form-control" placeholder="Waiting..."></textarea>' +
			                        '</div>' +
                                    '<div class="form-group">' +
			                        	'<textarea id="player3" class="form-control" placeholder="Waiting..."></textarea>' +
			                        '</div>' +
			                    '</form>' +
		                    '</div>' +
                        '</div>' +
                    '</div>',
                    // tslint:disable-next-line:object-literal-sort-keys
					buttons: {
						success: {
                            className: "btn-success",
							label: "SEND MESSAGE",
							// tslint:disable-next-line:object-literal-sort-keys
							callback: () => {
                                this.waitUntilGameStarts();
                                bootbox.hideAll();
							},
						},
					},
                });

                for (let x = 0; x < ludogame.ludoPlayers.length; x++) {
                    $("#player" + x).val(ludogame.ludoPlayers[x].playerName);
                }
                */
        }
}
