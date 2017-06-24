/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import { UUID } from "angular2-uuid";
import { Piece } from "../entities/Piece";
import { AIPlayer } from "../entities/AIPlayer";
import { Player } from "../entities/Player";
import { RegularPlayer } from "../entities/RegularPlayer";
import { ColorType } from "../enums/ColorType";
import { ActiveBoard } from "../entities/ActiveBoard";
import { HomeBoard } from "../entities/HomeBoard";
import { OnWayOutBoard } from "../entities/OnWayOutBoard";
import { ExitedBoard } from "../entities/ExitedBoard";
import { AllPossibleMoves } from "../rules/AllPossibleMoves";
import { Dice } from "../entities/Dice";
import { Rules } from "../rules/Rules";
import { factory } from "../logging/ConfigLog4j";
import { Scheduler } from "../rules/Scheduler";
import { RuleEnforcer } from "../rules/RuleEnforcer";
import * as Paths from "../entities/Paths";
import { States } from "../enums/States";
import { PlayerMode } from "../enums/PlayerMode";
import { Board } from "../entities/Board";
import { PiecePosition } from "../entities/PiecePosition";
import { Move } from "../rules/Move";
import { LudoGame } from "../game/LudoGame";
import { LudoPlayer } from "../game/LudoPlayer";
import { NewPlayers } from "../entities/NewPlayers";
import { Emit } from "../emit/Emit";
import { LocalGame } from "../game/LocalGame";
import { Dictionary } from "typescript-collections";
import * as $ from "jquery";
import * as cio from "socket.io-client";
declare var Example: any;

const log = factory.getLogger("model.Game");

let emit = Emit.getInstance();
let localGame = LocalGame.getInstance();
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
    private currentPlayerName: string;
    private playerNames = new Dictionary<String, any>();

    public init(newPlayers: NewPlayers) {
        this.newPlayers = newPlayers;
        log.debug("Single player? " + emit.isSinglePlayer() + " Multi player? " + emit.isMultiPlayer() + " Creator? " + emit.getCreator());
        if (this.newPlayers.hasSavedGame) {
            this.gameId = newPlayers.ludogame.gameId;
            this.playerMode = newPlayers.ludogame.playerMode;
        } else {
            this.gameId = this.generateGameId(5);
            this.currentPlayerName = this.newPlayers.playerName;
            this.playerMode = newPlayers.playerMode;
        }
    }

    public create() {
        this.signal = new Phaser.Signal();
        let board = this.add.sprite(0, 0, "board");
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
        let updateBtn = this.make.button(810, 323, "updateBtn", this.saveLudoGame, this, 2, 1, 0);
        updateBtn.alpha = 0.5;
        updateBtn.scale.x = 0.6;
        updateBtn.scale.y = 0.6;
        buttonGroup.add(updateBtn);
        this.game.stage.disableVisibilityChange = true;
        this.signal.add(this.resaveGame, this, 0);

        if (this.newPlayers.hasSavedGame) {
            if (emit.getEnableSocket()) {
                this.socket = cio({reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000, reconnectionAttempts: 5});
            }
            let dieOneUUID = this.newPlayers.ludogame.ludoDice.dieOne.uniqueId;
            let dieTwoUUID = this.newPlayers.ludogame.ludoDice.dieTwo.uniqueId;
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.newPlayers.ludogame.gameId);
            this.dice.dieOne.setDieFrame(this.newPlayers.ludogame.ludoDice.dieOne);
            this.dice.dieTwo.setDieFrame(this.newPlayers.ludogame.ludoDice.dieTwo);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.newPlayers.ludogame.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.game, this.scheduler, this.dice, activeboard, homeboard,
                onWayOutBoard, exitedBoard, this.newPlayers.ludogame.gameId, this.socket, currentPossibleMovements);
            let players: Player[] = [];
            for (let ludoPlayer of this.newPlayers.ludogame.ludoPlayers) {
                if (ludoPlayer !== null && typeof ludoPlayer !== "undefined") {
                    let player = this.createExistingPlayer(ludoPlayer);
                    this.scheduler.enqueue(player);
                    for (let piece of player.pieces) {
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
                    players.push(player);
                    this.enforcer.setPlayers(player);
                }
            }
            this.players = players;
            this.displayGameId(this.newPlayers.ludogame.gameId);
            if (emit.isSinglePlayer()) {
                localGame.setLudoGame(this.newPlayers.ludogame);
                this.displayNames(this.newPlayers.ludogame);
                this.waitUntilGameStarts();
            }else {
                if (emit.getEnableSocket()) {
                    this.setSocketHandlers();
                    this.joinExistingGame();
                }
            }

        } else {
            if (emit.getEnableSocket()) {
                this.socket = cio({reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000, reconnectionAttempts: 5});
            }
            log.debug("Enable socket: " + emit.getEnableSocket());
            log.debug("Enable emit: " + emit.getEmit());
            let dieOneUUID = UUID.UUID();
            let dieTwoUUID = UUID.UUID();
            this.dice = new Dice(this.game, "die", this.signal, dieOneUUID, dieTwoUUID, this.socket, this.gameId);
            this.scheduler = new Scheduler(this.dice, this.socket, this.signal, this.gameId);
            emit.setScheduler(this.scheduler);
            this.enforcer = new RuleEnforcer(this.signal, this.game, this.scheduler, this.dice, activeboard, homeboard,
                onWayOutBoard, exitedBoard, this.gameId, this.socket, currentPossibleMovements);
            this.players = this.createNewPlayers(this.newPlayers);
            let sequenceNumber = 0;
            for (let player of this.players) {
                player.sequenceNumber = sequenceNumber;
                ++sequenceNumber;
                this.scheduler.enqueue(player);
                for (let piece of player.pieces) {
                    homeboard.addPieceToHomeBoard(piece);
                }
            }
            this.enforcer.players = this.players;
            /*
            if (emit.getCreator()) {
                this.scheduler.getNextPlayer();
                let playerOne = this.players[0];
                // this.saveGame();
                for (let x = 1; x < playerOne.pieces.length; x++) {
                    homeboard.removePieceFromHomeBoard(playerOne.pieces[x]);
                    exitedBoard.addPieceToActiveBoard(playerOne.pieces[x]);
                    playerOne.pieces[x].setExited();
                    playerOne.pieces[x].visible = false;
                }

                let p1 = playerOne.pieces[0];
                homeboard.removePieceFromHomeBoard(p1);
                // this.setActivePieceParameters(p1, 51, States.Active, activeboard);
                this.setOnWayOutPieceParameters(p1, 2, States.onWayOut, onWayOutBoard);
                let playerTwo = this.players[1];
                let p2 = playerTwo.pieces[0];
                homeboard.removePieceFromHomeBoard(p2);
                this.setActivePieceParameters(p2, 40, States.Active, activeboard);

                let p3 = playerTwo.pieces[5];
                homeboard.removePieceFromHomeBoard(p3);
                this.setActivePieceParameters(p3, 27, States.Active, activeboard);

                this.dice.dieOne.setDieFrameValue(0);
                this.dice.dieTwo.setDieFrameValue(0);
            }
            */
            this.setSocketHandlers();
            this.createGame();
        }

        log.debug(" Iscreator is " + emit.getCreator());
        this.checkIfPlayerWon();

    }

    public rollDice(): void {
        this.enforcer.scheduler.getCurrentPlayer().roll(this.dice);
    }

    public playDice(): void {
        let dieIds = this.dice.getSelectedDiceUniqueIds();
        let player = this.scheduler.getCurrentPlayer();

        if (player.currentSelectedPiece !== null && (this.dice.dieOne.isSelected() || this.dice.dieTwo.isSelected())) {
            this.enforcer.generatePieceMovement(dieIds, player.currentSelectedPiece);
        } else {
            log.debug("No die selected or no piece selected");
        }
    }

    public update(): void {
        //
    }

    private displayGameId(gameId: string): void {
        let gameIdText = this.game.add.text(0, 0, gameId, { font: "30px Revalia", fill: "#00ffff", boundsAlignH: "center", boundsAlignV: "middle" });
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
        log.debug(" Emit is " + emit.getEmit());
        if (this.scheduler.getCurrentPlayer().isAI) {
            log.debug("Hey I am AI " + emit.getEmit());
            if (this.dice.bothDiceConsumed()) {
                if (emit.getEmit() || emit.isSinglePlayer()) {
                    this.signal.dispatch("aiRollDice", this.dice, this.scheduler.getCurrentPlayer().playerId);
                }
            } else {
                this.enforcer.setRollCounter(1);
                this.enforcer.endOfDiceRoll("endOfDieRoll");
            }
        } else if (this.scheduler.getCurrentPlayer().isAI === false && this.dice.bothDiceConsumed() === false) {
            this.enforcer.setRollCounter(1);
            this.enforcer.endOfDiceRoll("endOfDieRoll");
        }
        this.enforcer.rule.checkBoardConsistencies();
    }


    private ireport(): void {
        //
    }

    private saveGame(): void {
        let ludogame = new LudoGame(this.players, this.dice, this.gameId);
        ludogame.ludoDice.dieOne.isConsumed = false;
        ludogame.ludoDice.dieTwo.isConsumed = false;
        ludogame.ludoDice.dieOne.extFrame = 0;
        ludogame.ludoDice.dieTwo.extFrame = 2;
        ludogame.ludoDice.dieOne.dieValue = 6;
        ludogame.ludoDice.dieTwo.dieValue = 2;
        log.debug(JSON.stringify(ludogame, null, "\t"));
        ludogame.ludoPlayers[0].playerName = this.currentPlayerName;
        ludogame.currrentPlayerId = ludogame.ludoPlayers[0].playerId;
        ludogame.ludoPlayers[0].isEmpty = false;
        if (emit.getEnableSocket() === true) {
                this.socket.emit("saveGame", ludogame, (data: any) => {
                log.debug(" I saved....");
            });
        }
    }

    private saveLudoGame(): void {
        if (emit.getCreator()) {
            if (emit.isSinglePlayer() === false) {
                this.socket.emit("saveLudoGame", this.gameId, (ludogame: LudoGame) => {
                    if (ludogame) {
                        log.debug(" I saved...." + ludogame.gameId);
                    }
                    Display.show(" I saved...." + ludogame.gameId);
                });
            }
        }else if (emit.isSinglePlayer()) {
           localGame.saveLudoGame(this.gameId);
        }else {
             Display.show("You cannot save because you are NOT the creator");
        }
    }

    private resaveGame(listener: string): void {
        if (listener === "resaveGame" && emit.getCreator()) {
            let ludogame = new LudoGame(this.players, this.dice, this.gameId);
            ludogame.currrentPlayerId = ludogame.ludoPlayers[0].playerId;
            for (let ludoplayer of ludogame.ludoPlayers) {
                ludoplayer.isEmpty = false;
            }
            emit.setEmit(true);
            // log.debug(JSON.stringify(ludogame, null, "\t"));
            if (emit.getEnableSocket()) {
                    this.socket.emit("saveGame", ludogame, (data: any) => {
                    log.debug(" I resaved....");
                    let currentPlayer = this.scheduler.getCurrentPlayer();
                    if (currentPlayer.isAI && emit.getEmit()) {
                        this.signal.dispatch("aiRollDice", this.dice, currentPlayer.playerId);
                    }
                });
            }
        }
    }

    private createGame(): void {
        let ludogame = new LudoGame(this.players, this.dice, this.gameId);
        // first player is always the creator's player
        ludogame.ludoPlayers[0].playerName = this.currentPlayerName;
        ludogame.ludoPlayers[0].sequenceNumber = 0;
        ludogame.availableColors = this.getAvailableColors(ludogame.ludoPlayers[0].colors, ludogame);
        emit.setCurrentPlayerId(ludogame.ludoPlayers[0].playerId);
        ludogame.currrentPlayerId = ludogame.ludoPlayers[0].playerId;
        ludogame.creatorPlayerId = ludogame.ludoPlayers[0].playerId;
        ludogame.playerMode = this.newPlayers.numOfPlayers;
        ludogame.gameMode = emit.getGameMode();
        this.displayGameId(ludogame.gameId);
        if (emit.isSinglePlayer()) {
            localGame.setLudoGame(ludogame);
            this.displayNames(ludogame);
            this.waitUntilGameStarts();
        }else {
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
        for (let y = 0; y < ludogame.availableColors.length; ++y) {
            if (!this.containsColor(chosenColors, ludogame.availableColors[y])) {
                availableColors.push(ludogame.availableColors[y]);
            }
        }
        return availableColors;
    }

    private containsColor(colors: string[], color: string): boolean {
        let contains = false;
        for (let c of colors) {
            if (c === color) {
                contains = true;
            }
        }
        return contains;
    }

    private createNewPlayers(newPlayers: NewPlayers): Player[] {
        let players: Player[] = [];
        for (let newPlayer of newPlayers.newPlayers) {
            if (newPlayer.isAI) {
                let aiPlayer = new AIPlayer(this.game, UUID.UUID(), true, newPlayer.color, this.signal, "", this.socket, this.gameId, null, this.enforcer);
                players.push(aiPlayer);
            } else {
                let regularPlayer = new RegularPlayer(this.game, UUID.UUID(), true, newPlayer.color, this.signal, "", this.socket, this.gameId, null, this.enforcer);
                players.push(regularPlayer);
            }
        }
        return players;
    }

    private createExistingPlayer(ludoPlayer: LudoPlayer): Player {
        if (ludoPlayer.isAI) {
            let player = new AIPlayer(this.game, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
                this.signal, ludoPlayer.playerName, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
            player.sequenceNumber = ludoPlayer.sequenceNumber;
            return player;
        } else {
            let player = new RegularPlayer(this.game, ludoPlayer.playerId, ludoPlayer.turn, ludoPlayer.colorTypes,
                this.signal, ludoPlayer.playerName, this.socket, this.gameId, ludoPlayer.pieces, this.enforcer);
            player.setSelectedPieceByUniqueId(ludoPlayer.currentSelectedPiece);
            player.sequenceNumber = ludoPlayer.sequenceNumber;
            return player;
        }
    }

    private fullScreen(): void {
        /*
        if (this.scale.isFullScreen) {
            this.scale.stopFullScreen();
        } else {
            this.scale.startFullScreen(false);
        }
        */
        log.debug("Writing to console " + this.gameId);
        // localGame.writeGameToConsole(this.gameId);
        localStorage.clear();
    }

    private generateGameId(length: number): string {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }

    private displayNames(ludogame: LudoGame): void {
        for (let player of ludogame.ludoPlayers) {
            for (let color of player.colors) {
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
        if (emit.getEnableSocket() === false) {
            // this.localGame.setLudoGame(ludogame);
        }
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
        if (emit.getEnableSocket() === true) {
                this.socket.on("updateJoinedPlayer", (ludogame: any, playerName: string) => {
                Display.show(`${playerName} has joined game`);
                this.displayNames(ludogame);
            });
        }
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

    private checkIfPlayerWon(): void {
        if (emit.getCreator() && this.scheduler.weHaveAWinningPlayer()) {
            if (emit.isMultiPlayer()) {
                this.enforcer.restartMultiPlayerGame();
            }else if (emit.isSinglePlayer()) {
                this.enforcer.restartSinglePlayerGame();
            }
        }
    }
}
