/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {factory} from "../logging/ConfigLog4j";
import {Piece} from "../entities/Piece";
import {Dice} from "../entities/Dice";
import {Perimeter} from "../entities/Perimeters";

const log = factory.getLogger("model.Scheduler");

export class Scheduler {
    public schedule: Collections.Queue<Player>;
    public allPieces: Collections.Dictionary<String, Piece>;
    public players: Player[] = [];
    private dice: Dice;
    private sequenceNumber = 0;
    constructor(dice: Dice) {
        this.schedule = new Collections.Queue<Player>();
        this.allPieces = new Collections.Dictionary<String, Piece>();
        this.dice = dice;
    }

    public getNextPlayer(): Player {
        let player = this.schedule.peek();
        if (player.previousDoubleSix === false) {
            this.dice.consumeDice();
            player = this.schedule.dequeue();
            player.unselectAllPiece();
            player.turn = false;
            this.schedule.enqueue(player);
            player = this.schedule.peek();
            player.selectAllPiece();
            player.turn = true;
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

    public addPerimetersToPool(perimeters: Perimeter[], playerId: string): void {
        if (perimeters.length > 0) {
             for (let player of this.players){
                 if (player.playerId !== playerId) {
                    player.addPerimetersToPool(perimeters);
                 }
            }
        }
    }
}
