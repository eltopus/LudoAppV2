/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {factory} from "../logging/ConfigLog4j";
import {Piece} from "../entities/Piece";

const log = factory.getLogger("model.Scheduler");

export class Scheduler {
    public schedule: Collections.Queue<Player>;
    public allPieces: Collections.Dictionary<String, Piece>;
    constructor() {
        this.schedule = new Collections.Queue<Player>();
        this.allPieces = new Collections.Dictionary<String, Piece>();
    }

    public getNextPlayer(): Player {
        let player = this.schedule.peek();
        if (player.previousDoubleSix === false) {
            player = this.schedule.dequeue();
            player.unselectAllPiece();
            this.schedule.enqueue(player);
            player = this.schedule.peek();
            player.selectAllPiece();
        }else {
            // Returning same player. Set value back to false
            player.previousDoubleSix =  false;
        }
        return player;
    }

    public enqueue(player: Player): void {
        if (this.schedule.isEmpty()) {
            player.selectAllPiece();
            this.schedule.enqueue(player);
        }else {
            player.unselectAllPiece();
            this.schedule.enqueue(player);
        }
        for (let piece of player.pieces){
            this.allPieces.setValue(piece.uniqueId, piece);
        }
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
}
