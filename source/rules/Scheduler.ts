/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {factory} from "../logging/ConfigLog4j";
import {Piece} from "../entities/Piece";
import {Dice} from "../entities/Dice";
import {Perimeter} from "../entities/Perimeters";
import {Emit} from "../emit/Emit";
import {LudoGame} from "../game/LudoGame";
import {LudoPlayer} from "../game/LudoPlayer";
import * as checksum from "checksum";

const log = factory.getLogger("model.Scheduler");
let emit = Emit.getInstance();
export class Scheduler {
    public schedule: Collections.Queue<Player>;
    public allPieces: Collections.Dictionary<String, Piece>;
    public players: Player[] = [];
    private dice: Dice;
    private sequenceNumber = 0;
    private socket: any;
    private gameId: string;
    constructor(dice: Dice, socket: any, gameId: string) {
        this.schedule = new Collections.Queue<Player>();
        this.allPieces = new Collections.Dictionary<String, Piece>();
        this.dice = dice;
        this.socket = socket;
        this.gameId = gameId;
    }

    public getNextPlayer(): Player {
        let player = this.schedule.peek();
        if (player.previousDoubleSix === false) {
            if (emit.getEmit()) {
                this.changePlayer(player);
            }
            this.dice.consumeWithoutEmission();
            player = this.schedule.dequeue();
            player.unselectAllPiece();
            player.turn = false;
            this.schedule.enqueue(player);
            player = this.schedule.peek();
            player.selectAllPiece();
            player.turn = true;
            let currentplayer = this.players.pop();
            this.players.unshift(currentplayer);
            /*
            if (!emit.getEmit()) {
                this.socket.emit("getCheckSum", this.gameId, (game_check_sum: string) => {
                    this.compareCheckSum(game_check_sum);
                });
            }
            */
        }else {
            // Returning same player. Set value back to false
            player.previousDoubleSix =  false;
        }
        return player;
    }

    public enqueue(player: Player): void {
        if (this.schedule.isEmpty()) {
            player.selectAllPiece();
            player.sequenceNumber = this.sequenceNumber;
            ++this.sequenceNumber;
            this.schedule.enqueue(player);
        }else {
            player.unselectAllPiece();
            player.sequenceNumber = this.sequenceNumber;
            ++this.sequenceNumber;
            this.schedule.enqueue(player);
        }
        for (let piece of player.pieces){
            this.allPieces.setValue(piece.uniqueId, piece);
        }
        this.players.push(player);
    }

    public getPieceByUniqueId(uniqueId: string): Piece {
        return this.allPieces.getValue(uniqueId);
    }

    public getCurrentPlayer(): Player {
        return (this.schedule.peek());
    }

    public getPieceOwner(uniqueId: string): Player {
        let owner: Player = null;
        this.schedule.forEach(function(player){
            if (player.pieceBelongsToMe(uniqueId)) {
                owner = player;
            }
        });
        return owner;
    }

    public getHomeEnemyPerimeters(): Perimeter[] {
        let currentPlayer = this.getCurrentPlayer();
        let enemyPerimeter: Perimeter[] = [];
        for (let player of this.players){
            if (player.playerId !== currentPlayer.playerId) {
                let sampleHomePieces = this.getCurrentPlayer().getSampleHomePieces();
                if (sampleHomePieces.length > 0) {
                    enemyPerimeter = player.piecesWithinHomePerimeters(sampleHomePieces);
                }
            }
        }
        return enemyPerimeter;
    }

    public getActiveEnemyPerimeterss(): Perimeter[] {
        let currentPlayer = this.getCurrentPlayer();
        let enemyPerimeter: Perimeter[] = [];
        for (let player of this.players){
            if (player.playerId !== currentPlayer.playerId) {
                let sampleActivePieces = this.getCurrentPlayer().getSampleActivePieces();
                if (sampleActivePieces.length > 0) {
                    enemyPerimeter = player.piecesWithinHomePerimeters(sampleActivePieces);
                }
            }
        }
        return enemyPerimeter;
    }

    public updatePlayers(ludoplayer: LudoPlayer): void {
        for (let player of this.players){
            if (ludoplayer.playerId === player.playerId) {
                player.updateLudoPieces(ludoplayer.pieces);
            }
        }
    }

    public addPerimetersToPool(perimeters: Perimeter[], playerId: string): void {
        if (perimeters.length > 0) {
             for (let player of this.players){
                 if (player.playerId !== playerId) {
                    player.addPerimetersToPool(perimeters);
                 }
            }
        }
    }
    private changePlayer(player: Player): void {
        // log.debug("PlayerColor: " + player.getColorTypes().join());
        this.socket.emit("changePlayer", this.gameId);
    }

    private compareCheckSum(check_sum_from_server: string): void {
        let ludogame = new LudoGame(this.players, this.dice, this.gameId);
        let check_sum_from_client = "";
        for (let lp of ludogame.ludoPlayers){
            check_sum_from_client = check_sum_from_client + "#" + (checksum(JSON.stringify(lp.pieces)));
        }
        if (check_sum_from_client !== check_sum_from_server) {
            log.debug("Client: "  + check_sum_from_client + " NOT EQUAL Server: " + check_sum_from_server);
        }else {
            log.debug("Checksum is good");
        }
    }
}
